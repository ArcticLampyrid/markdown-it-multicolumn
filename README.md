# markdown-it-multicolumn

MultiColumn plugin for markdown-it.


## Install

```
npm install markdown-it-multicolumn --save
```

## Usage
```js
import markdownIt from 'markdown-it'
import markdownItMultiColumn from 'markdown-it-multicolumn'

const mdi = markdownIt()
mdi.use(markdownItMultiColumn)
console.log(mdi.render(`---:1
Hi, W=1/6
:--:2
Hi, W=1/3
:--:3
Hi, W=1/2
:---
`))
```

## Screenshot
![Screenshot 1](https://raw.githubusercontent.com/1354092549/markdown-it-multicolumn/master/screenshot/1.png)   