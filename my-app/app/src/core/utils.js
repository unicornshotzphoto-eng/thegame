



function log() {
    for (let i = 0; i < arguments.length; i++) {
        let arg = arguments[i];

        if (typeof arg === 'object') {
            console.log(JSON.stringify(arg, null, 2));
        } else {
            console.log(arg);
        }


    }
}

export { log };