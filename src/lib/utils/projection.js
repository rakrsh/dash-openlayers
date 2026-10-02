import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

const registerProjections = (proj4Defs) => {
  if (!proj4Defs || proj4Defs.length === 0) return;

  proj4Defs.forEach(({ code, def }) => {
    proj4.defs(code, def);
  });
  register(proj4);
};

export { registerProjections };
