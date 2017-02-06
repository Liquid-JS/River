Install: ```npm install -g @liquid-js/river```

```javascript
const river = require('@liquid-js/river')

exports.task = {
    requirements: ['task1'],
    then: () => river.loadFiles(['src/content/**/*.json', 'src/content/**/*.bson'])
        .then(files => {
            return files
        })
        .then(river.writeFiles('tst'))

}

exports.task1 = {
    requirements: [],
    then: () => river.loadFiles(['src/content/**/*.json', 'src/content/**/*.bson'])
        .then(files => {
            return files
        })
        .then(river.writeFiles('tst1'))

}

exports.task2 = {
    requirements: ['task1'],
    then: () => river.loadFiles(['src/content/**/*.json', 'src/content/**/*.bson'])
        .then(files => {
            return files
        })
        .then(river.writeFiles('tst1'))

}
```

Run: ```river task task1```