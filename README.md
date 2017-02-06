```javascript
loadFiles(['dist/*.js', 'src/**/*.ts'])
    .then(files => {
        return files.map(file => {
            file.contents = new Buffer('Who cares, this shit works!')
            return file
        })
    })
    .then(writeFiles('tst'))
```