import markdownIt from "markdown-it"
import Token from "markdown-it/lib/token"
import StateBlock from "markdown-it/lib/rules_block/state_block"
import Renderer from "markdown-it/lib/renderer"

interface BlockTokenMeta{
    growth:number
}

function render(tokens: Token[], index: number, options: any, env: any, self: Renderer) {
    switch (tokens[index].type) {
        case "multicolumn_open":
            tokens[index].attrJoin("class", "multicolumn");
            tokens[index].attrJoin("style", "display: flex; flex-direction: row; align-items: flex-start;");
            break;
        case "multicolumn_block_open":
            tokens[index].attrJoin("class", "multicolumn-column");
            tokens[index].attrJoin("style", `flex-grow: ${(tokens[index].meta as BlockTokenMeta).growth}; width:0;`);
            break;
    }
    return (self as any).renderToken(tokens, index, options, env, self);
}

function ruler(state: StateBlock, startLine: number, endLine: number, silent?: boolean) {
    var start = state.bMarks[startLine] + state.tShift[startLine];
    //Quickly check 
    var firstChar = state.src.charCodeAt(start);
    if (firstChar != 45) {
        return false;
    }
    var max = state.eMarks[startLine];
    if (max - start < 4) {
        return false;
    }
    if (state.src.substr(start, 4) !== "---:") {
        return false;
    }
    var containerToken: Token = state.push('multicolumn_open', 'div', 1);
    containerToken.block = true;
    var blockToken: Token = state.push('multicolumn_block_open', 'div', 1);
    blockToken.block = true;

    var growth = parseInt(state.src.substring(start + 4, max).trim(), 10) || 1;
    (blockToken.meta as BlockTokenMeta) = {
        growth : growth
    }

    var autoClosed = false;
    var nextLine = startLine;

    var parseContent = (startLine: number, endLine: number) => {
        var old_line_max = state.lineMax;
        var old_parent = state.parentType;
        (state.parentType as string) = 'multicolumn';
        state.lineMax = endLine;
        (state.md.block as any).tokenize(state, startLine, endLine);
        state.parentType = old_parent;
        state.lineMax = old_line_max;
    }

    var startCount = 1;

    for (; ;) {
        nextLine++;
        if (nextLine >= endLine) {
            autoClosed = true;
            break;
        }

        start = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];
        if (max - start < 4) {
            continue;
        }

        if (state.src.substr(start, 4) === "---:") {
            startCount++;
        }
        else if (state.src.substr(start, 4) === ":---") {
            startCount--;
            if (!startCount) {
                break;
            }
        }
        else if (state.src.substr(start, 4) === ":--:") {
            parseContent(startLine + 1, nextLine);
            blockToken = state.push('multicolumn_block_close', 'div', -1);
            blockToken.block = true;
            blockToken = state.push('multicolumn_block_open', 'div', 1);
            blockToken.block = true;

            var growth = parseInt(state.src.substring(start + 4, max).trim(), 10) || 1;
            (blockToken.meta as BlockTokenMeta) = {
                growth : growth
            }

            startLine = nextLine;
        }
    }

    parseContent(startLine + 1, nextLine);
    blockToken = state.push('multicolumn_block_close', 'div', -1);
    blockToken.block = true;
    containerToken = state.push('multicolumn_close', 'div', -1);
    containerToken.block = true;

    state.line = nextLine + (autoClosed ? 0 : 1);
    return true;
}

const MultiColumnPlugin = (md: markdownIt) => {
    md.block.ruler.before('fence', 'multicolumn', ruler as any, {
        alt: ['paragraph', 'reference', 'blockquote', 'list']
    });

    md.renderer.rules['multicolumn_open'] = render;
    md.renderer.rules['multicolumn_block_open'] = render;
    md.renderer.rules['multicolumn_block_close'] = render;
    md.renderer.rules['multicolumn_close'] = render;
}

export default MultiColumnPlugin
