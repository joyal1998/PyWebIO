import {Command, Session} from "../session";
import {config, state} from '../state'
import {body_scroll_to, box_scroll_to} from "../utils";

import {getWidgetElement} from "../models/output"
import {CommandHandler} from "./base";


export class OutputHandler implements CommandHandler {
    session: Session;

    accept_command = ['output', 'output_ctl'];

    private readonly container_parent: JQuery;
    private readonly container_elem: JQuery;

    constructor(session: Session, container_elem: JQuery) {
        this.session = session;
        this.container_elem = container_elem;
        this.container_parent = this.container_elem.parent();
    }

    scroll_bottom() {
        // 固定高度窗口滚动
        if (state.OutputFixedHeight)
            box_scroll_to(this.container_elem, this.container_parent, 'bottom', undefined, 30);
        // 整个页面自动滚动
        body_scroll_to(this.container_parent, 'bottom');
    };

    handle_message(msg: Command) {
        let scroll_bottom = false;
        if (msg.command === 'output') {
            let elem;
            try {
                elem = getWidgetElement(msg.spec);
            } catch (e) {
                return console.error(`Handle command error, command: ${msg}, error:${e}`);
            }

            if (config.outputAnimation) elem.hide();
            let container_elem = this.container_elem.find(`#${msg.spec.scope || 'pywebio-scope-ROOT'}`);
            if (container_elem.length === 0)
                return console.error(`Scope '${msg.spec.scope}' not found`);

            if (!msg.spec.scope || msg.spec.scope === 'pywebio-scope-ROOT') scroll_bottom = true;

            if (msg.spec.position === 0)
                container_elem.prepend(elem);
            else if (msg.spec.position === -1)
                container_elem.append(elem);
            else {
                let pos = $(container_elem[0].children).eq(msg.spec.position);
                if (msg.spec.position >= 0)
                    elem.insertBefore(pos);
                else
                    elem.insertAfter(pos);
            }

            if (config.outputAnimation) elem.fadeIn();
        } else if (msg.command === 'output_ctl') {
            this.handle_output_ctl(msg);
        }
        // 当设置了AutoScrollBottom、并且当前输出输出到页面末尾时，滚动到底部
        if (state.AutoScrollBottom && scroll_bottom)
            this.scroll_bottom();
    };

    handle_output_ctl(msg: Command) {
        if (msg.spec.title) {
            $('#title').text(msg.spec.title);  // 直接使用#title不规范 todo
            document.title = msg.spec.title;
        }
        if (msg.spec.output_fixed_height !== undefined) {
            state.OutputFixedHeight = msg.spec.output_fixed_height;
            if (msg.spec.output_fixed_height)
                $('.container').removeClass('no-fix-height');  // todo 不规范
            else
                $('.container').addClass('no-fix-height');  // todo 不规范
        }
        if (msg.spec.auto_scroll_bottom !== undefined)
            state.AutoScrollBottom = msg.spec.auto_scroll_bottom;
        if (msg.spec.set_scope !== undefined) {
            let spec = msg.spec as {
                set_scope: string, // scope名
                container: string, // 此scope的父scope
                position: number, // 在父scope中创建此scope的位置 0 -> 在父scope的顶部创建, -1 -> 在父scope的尾部创建
                if_exist: string // 已经存在 ``name`` scope 时如何操作:  `'remove'` 表示先移除旧scope再创建新scope， `'none'` 表示不进行任何操作, `'clear'` 表示将旧scope的内容清除，不创建新scope
            };

            let container_elem = $(`#${spec.container}`);
            if (container_elem.length === 0)
                return console.error(`Scope '${msg.spec.scope}' not found`);

            let old = this.container_elem.find(`#${spec.set_scope}`);
            if (old.length) {
                if (spec.if_exist == 'none')
                    return;
                else if (spec.if_exist == 'remove')
                    old.remove();
                else if (spec.if_exist == 'clear') {
                    old.empty();
                    return;
                }
            }

            let html = `<div id="${spec.set_scope}"></div>`;
            if (spec.position === 0)
                container_elem.prepend(html);
            else if (spec.position === -1)
                container_elem.append(html);
            else {
                if (spec.position >= 0)
                    $(`#${spec.container}>*`).eq(spec.position).insertBefore(html);
                else
                    $(`#${spec.container}>*`).eq(spec.position).insertAfter(html);
            }
        }
        if (msg.spec.clear !== undefined)
            this.container_elem.find(`#${msg.spec.clear}`).empty();
        if (msg.spec.clear_before !== undefined)
            this.container_elem.find(`#${msg.spec.clear_before}`).prevAll().remove();
        if (msg.spec.clear_after !== undefined)
            this.container_elem.find(`#${msg.spec.clear_after}~*`).remove();
        if (msg.spec.scroll_to !== undefined) {
            let target = $(`#${msg.spec.scroll_to}`);
            if (!target.length) {
                console.error(`Scope ${msg.spec.scroll_to} not found`);
            } else if (state.OutputFixedHeight) {
                box_scroll_to(target, this.container_parent, msg.spec.position);
            } else {
                body_scroll_to(target, msg.spec.position);
            }
        }
        if (msg.spec.clear_range !== undefined) {
            if (this.container_elem.find(`#${msg.spec.clear_range[0]}`).length &&
                this.container_elem.find(`#${msg.spec.clear_range[1]}`).length) {
                let removed: HTMLElement[] = [];
                let valid = false;
                this.container_elem.find(`#${msg.spec.clear_range[0]}~*`).each(function () {
                    if (this.id === msg.spec.clear_range[1]) {
                        valid = true;
                        return false;
                    }
                    removed.push(this);
                    // $(this).remove();
                });
                if (valid)
                    $(removed).remove();
                else
                    console.warn(`clear_range not valid: can't find ${msg.spec.clear_range[1]} after ${msg.spec.clear_range[0]}`);
            }
        }
        if (msg.spec.remove !== undefined)
            this.container_elem.find(`#${msg.spec.remove}`).remove();
    };

}