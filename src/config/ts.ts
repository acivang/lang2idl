export let tsconfig = {
    "compilerOptions": {
        "module": "commonjs",
        "moduleResolution": "node",
        "noImplicitAny": true,
        "preserveConstEnums": true,
        "sourceMap": false,
        "target": "es6",
        "declaration":true
    },
    "include": [
        "./**/*"
    ],
    "compileOnSave": true
};