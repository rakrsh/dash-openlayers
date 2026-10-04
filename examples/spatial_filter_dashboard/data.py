POINTS = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": coordinates},
            "properties": {"name": name, "category": category},
        }
        for name, coordinates, category in [
            ("Paddington", [-0.176, 51.516], "rail"),
            ("Marylebone", [-0.163, 51.522], "rail"),
            ("Soho", [-0.133, 51.513], "district"),
            ("Holborn", [-0.119, 51.517], "district"),
            ("Waterloo", [-0.113, 51.503], "rail"),
            ("Borough", [-0.091, 51.501], "district"),
            ("Shoreditch", [-0.078, 51.525], "district"),
            ("Liverpool Street", [-0.082, 51.518], "rail"),
            ("Kensington", [-0.188, 51.501], "district"),
            ("Camden", [-0.143, 51.539], "district"),
            ("Greenwich", [0.002, 51.478], "district"),
            ("Stratford", [-0.004, 51.543], "rail"),
        ]
    ],
}
