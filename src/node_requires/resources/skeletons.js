/**
 * Generates a square thumbnail of a given skeleton
 * @param {String} skeleton The skeleton object to generate a preview for.
 * @returns {Promise<void>} Resolves after creating a thumbnail.
 */
const skeletonGenPreview = function (skeleton) {
    const loader = new PIXI.loaders.Loader(),
          dbf = dragonBones.PixiFactory.factory;
    const fs = require('fs-extra'),
          path = require('path');
    const slice = skeleton.origname.replace('_ske.json', '');
    return new Promise((resolve, reject) => {
        // Draw the armature on a canvas/in a Pixi.js app
        loader.add(`${slice}_ske.json`, `${slice}_ske.json`)
              .add(`${slice}_tex.json`, `${slice}_tex.json`)
              .add(`${slice}_tex.png`, `${slice}_tex.png`);
        loader.load(() => {
            dbf.parseDragonBonesData(loader.resources[`${slice}_ske.json`].data);
            dbf.parseTextureAtlasData(loader.resources[`${slice}_tex.json`].data, loader.resources[`${slice}_tex.png`].texture);
            const skel = dbf.buildArmatureDisplay('Armature', loader.resources[`${slice}_ske.json`].data.name);

            const app = new PIXI.Application();

            const rawSkelBase64 = app.renderer.plugins.extract.base64(skel);
            const skelBase64 = rawSkelBase64.replace(/^data:image\/\w+;base64,/, '');
            const buf = new Buffer(skelBase64, 'base64');

            fs.writeFile(path.join(global.projdir, 'img', skeleton.origname + '.png'), buf)
            .then(() => {
                // Clean memory from DragonBones' armatures
                // eslint-disable-next-line no-underscore-dangle
                delete dbf._dragonBonesDataMap[loader.resources[`${slice}_ske.json`].data.name];
                // eslint-disable-next-line no-underscore-dangle
                delete dbf._textureAtlasDataMap[loader.resources[`${slice}_ske.json`].data.name];
            })
            .then(resolve)
            .catch(reject);
        });
    });
};

const importSkeleton = async function importSkeleton(source) {
    const generateGUID = require('./../generateGUID');
    const fs = require('fs-extra'),
          path = require('path');

    const uid = generateGUID();
    const partialDest = path.join(global.projdir + '/img/skdb' + uid);

    await Promise.all([
        fs.copy(source, partialDest + '_ske.json'),
        fs.copy(source.replace('_ske.json', '_tex.json'), partialDest + '_tex.json'),
        fs.copy(source.replace('_ske.json', '_tex.png'), partialDest + '_tex.png')
    ]);
    const skel = {
        name: path.basename(source).replace('_ske.json', ''),
        origname: path.basename(partialDest + '_ske.json'),
        from: 'dragonbones',
        uid
    };
    await skeletonGenPreview(skel);
    global.currentProject.skeletons.push(skel);
    window.signals.trigger('skeletonImported', skel);
};

module.exports = {
    skeletonGenPreview,
    importSkeleton
};
