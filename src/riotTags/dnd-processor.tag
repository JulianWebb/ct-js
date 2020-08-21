dnd-processor
    .aDropzone(if="{dropping}")
        .middleinner
            svg.feather
                use(xlink:href="data/icons.svg#download")
            h2 {languageJSON.common.fastimport}
            input(
                type="file" multiple
                accept=".png,.jpg,.jpeg,.bmp,.gif,.json,.ttf"
                onchange="{dndImport}"
            )
    script.
        this.dndImport = e => {
            const files = [...e.target.files].map(file => file.path);
            for (let i = 0; i < files.length; i++) {
                if (/\.(jpg|gif|png|jpeg)/gi.test(files[i])) {
                    const {importImageToTexture} = require('./data/node_requires/resources/textures');
                    importImageToTexture(files[i]);
                } else if (/_ske\.json/i.test(files[i])) {
                    const {importSkeleton} = require('./data/node_requires/resources/skeletons');
                    importSkeleton(files[i]);
                }
            }
            e.srcElement.value = '';
            this.dropping = false;
            e.preventDefault();
        };