import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Control from 'ol/control/Control';
import { unByKey } from 'ol/Observable';
import { useMap } from '../context/OLContext';

const LayerControl = ({ position, title }) => {
  const map = useMap();

  useEffect(() => {
    const element = document.createElement('div');
    element.className = 'ol-control';
    Object.assign(
      element.style,
      Object.fromEntries(position.split('-').map((side) => [side, '0.5em'])),
      {
        maxWidth: 'min(280px, calc(100% - 1em))',
        maxHeight: 'calc(100% - 1em)',
        overflowY: 'auto',
        padding: '10px',
        color: '#182522',
        background: 'rgba(255, 255, 255, 0.96)',
        border: '1px solid #778581',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(20, 35, 31, 0.18)',
      },
    );

    const heading = document.createElement('h2');
    heading.textContent = title;
    Object.assign(heading.style, { margin: '0 0 8px', fontSize: '14px', fontWeight: '600' });
    element.appendChild(heading);

    const list = document.createElement('ol');
    Object.assign(list.style, {
      display: 'grid',
      gap: '8px',
      margin: '0',
      padding: '0',
      listStyle: 'none',
    });
    element.appendChild(list);

    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'No controllable layers';
    Object.assign(emptyMessage.style, { margin: '0', fontSize: '13px' });
    element.appendChild(emptyMessage);

    const control = new Control({ element });
    map.addControl(control);

    const collection = map.getLayers();
    const rows = new Map();
    const layerListeners = new Map();

    const updateRow = (layer) => {
      const row = rows.get(layer);
      if (!row) return;
      row.checkbox.checked = layer.getVisible();
      row.opacity.value = String(layer.getOpacity());
      row.opacity.setAttribute('aria-valuetext', `${Math.round(layer.getOpacity() * 100)}%`);
      row.percent.textContent = `${Math.round(layer.getOpacity() * 100)}%`;
    };

    const moveLayer = (layer, direction) => {
      const currentLayers = collection.getArray();
      const index = currentLayers.indexOf(layer);
      if (index < 0) return;

      const managedIndexes = currentLayers
        .map((candidate, candidateIndex) =>
          candidate.get('dashLayerControl') === true ? candidateIndex : -1,
        )
        .filter((candidateIndex) => candidateIndex >= 0);
      const targetIndex =
        direction > 0
          ? managedIndexes.find((candidateIndex) => candidateIndex > index)
          : managedIndexes.filter((candidateIndex) => candidateIndex < index).pop();
      if (targetIndex === undefined) return;

      collection.removeAt(index);
      collection.insertAt(targetIndex > index ? targetIndex : targetIndex + 1, layer);
    };

    const createButton = (name, titleText, handler) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = name;
      button.title = titleText;
      button.setAttribute('aria-label', titleText);
      button.addEventListener('click', handler);
      return button;
    };

    const createRow = (layer) => {
      const rowElement = document.createElement('li');
      Object.assign(rowElement.style, {
        display: 'grid',
        gridTemplateColumns: 'minmax(70px, 1fr) minmax(70px, 1.2fr) auto',
        alignItems: 'center',
        gap: '6px',
      });

      const label = document.createElement('label');
      Object.assign(label.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        minWidth: '0',
      });
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      const name = layer.get('dashId') || layer.get('title') || 'Layer';
      checkbox.setAttribute('aria-label', `Visibility of ${name}`);
      checkbox.addEventListener('change', () => layer.setVisible(checkbox.checked));

      const nameElement = document.createElement('span');
      nameElement.textContent = name;
      Object.assign(nameElement.style, { overflow: 'hidden', textOverflow: 'ellipsis' });
      label.append(checkbox, nameElement);

      const opacity = document.createElement('input');
      opacity.type = 'range';
      opacity.min = '0';
      opacity.max = '1';
      opacity.step = '0.05';
      opacity.setAttribute('aria-label', `Opacity of ${name}`);
      opacity.addEventListener('input', () => layer.setOpacity(Number(opacity.value)));

      const percent = document.createElement('span');
      percent.setAttribute('aria-hidden', 'true');
      Object.assign(percent.style, { minWidth: '34px', textAlign: 'right' });

      const actions = document.createElement('span');
      Object.assign(actions.style, {
        gridColumn: '1 / -1',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '4px',
      });
      const moveUp = createButton('Up', `Move ${name} up`, () => moveLayer(layer, 1));
      const moveDown = createButton('Down', `Move ${name} down`, () => moveLayer(layer, -1));
      actions.append(moveUp, moveDown);
      rowElement.append(label, opacity, percent, actions);

      rows.set(layer, { element: rowElement, checkbox, opacity, percent, moveUp, moveDown });
      layerListeners.set(layer, [
        layer.on('change:visible', () => updateRow(layer)),
        layer.on('change:opacity', () => updateRow(layer)),
      ]);
      updateRow(layer);
    };

    const refreshRows = () => {
      const managedLayers = collection
        .getArray()
        .filter((layer) => layer.get('dashLayerControl') === true);
      const currentLayers = new Set(managedLayers);

      rows.forEach((row, layer) => {
        if (!currentLayers.has(layer)) {
          unByKey(layerListeners.get(layer));
          layerListeners.delete(layer);
          row.element.remove();
          rows.delete(layer);
        }
      });

      const orderedLayers = managedLayers.slice().reverse();
      orderedLayers.forEach((layer, index) => {
        if (!rows.has(layer)) createRow(layer);
        const row = rows.get(layer);
        row.moveUp.disabled = index === 0;
        row.moveDown.disabled = index === orderedLayers.length - 1;
        list.appendChild(row.element);
      });
      emptyMessage.hidden = orderedLayers.length > 0;
    };

    const collectionListeners = [
      collection.on('add', refreshRows),
      collection.on('remove', refreshRows),
    ];
    refreshRows();

    return () => {
      unByKey(collectionListeners);
      layerListeners.forEach((key) => unByKey(key));
      map.removeControl(control);
    };
  }, [map, position, title]);

  return null;
};

LayerControl.defaultProps = {
  position: 'top-right',
  title: 'Layers',
};

LayerControl.propTypes = {
  /** The ID used to identify this component in Dash callbacks. */
  id: PropTypes.string,
  /** Corner of the map where the control is displayed. */
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  /** Heading displayed above the layer controls. */
  title: PropTypes.string,
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default LayerControl;
