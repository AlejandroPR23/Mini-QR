/**
 * data.js
 * Carga todos los archivos JSON de configuración en paralelo.
 * Para agregar una nueva fuente de datos, añadir el fetch aquí y
 * retornarlo en el objeto final.
 */

export async function loadData() {
    const [patternsRes, cornersRes, logosRes, framesRes] = await Promise.all([
        fetch('data/patterns.json'),
        fetch('data/corners.json'),
        fetch('data/logos.json'),
        fetch('data/frames.json'),
    ]);

    const patternsData = await patternsRes.json();
    const cornersData = await cornersRes.json();
    const logosData = await logosRes.json();
    const framesData = await framesRes.json();

    const logos = logosData.logos.map(logo => ({
        ...logo,
        icon: logo.imageUrl,
    }));

    const frames = framesData.frames.map(f => {
        if (f.svgTemplate) {
            const txt = document.createElement('textarea');
            txt.innerHTML = f.svgTemplate;
            f.svgTemplate = txt.value;
        }
        return f;
    });

    return {
        patterns: patternsData.patterns,
        corners: cornersData.corners,
        categories: logosData.categories,
        logos,
        frames,
    };
}