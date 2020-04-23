function parseFile(evt) {
    if (!window.FileReader) return; // Browser is not compatible
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = function (evt) {
            if (evt.target.readyState != 2) return;
            if (evt.target.error) {
                alert('Error while reading file');
                return;
            }

            filecontent = evt.target.result;

            resolve(evt.target.result);
        };

        reader.readAsText(evt.target.files[0]);
    })
};