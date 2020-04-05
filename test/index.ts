import markdownIt from 'markdown-it'
import markdownItMultiColumn from '../src/index'

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