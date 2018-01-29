/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
import { AttributePart, defaultPartCallback, getValue, render as baseRender } from '../lit-html.js';
export { html } from '../lit-html.js';
/**
 *
 * @param result Renders a `TemplateResult` to a container using the
 * `extendedPartCallback` PartCallback, which allows templates to set
 * properties and declarative event handlers.
 *
 * Properties are set by default, instead of attributes. Attribute names in
 * lit-html templates preserve case, so properties are case sensitive. If an
 * expression takes up an entire attribute value, then the property is set to
 * that value. If an expression is interpolated with a string or other
 * expressions then the property is set to the string result of the
 * interpolation.
 *
 * To set an attribute instead of a property, append a `$` suffix to the
 * attribute name.
 *
 * Example:
 *
 *     html`<button class$="primary">Buy Now</button>`
 *
 * To set an event handler, prefix the attribute name with `on-`:
 *
 * Example:
 *
 *     html`<button on-click=${(e)=> this.onClickHandler(e)}>Buy Now</button>`
 *
 */
export function render(result, container) {
    baseRender(result, container, extendedPartCallback);
}
export const extendedPartCallback = (instance, templatePart, node) => {
    if (templatePart.type === 'attribute') {
        if (templatePart.rawName.startsWith('on-')) {
            const eventName = templatePart.rawName.slice(3);
            return new EventPart(instance, node, eventName);
        }
        if (templatePart.name.endsWith('$')) {
            const name = templatePart.name.slice(0, -1);
            return new AttributePart(instance, node, name, templatePart.strings);
        }
        return new PropertyPart(instance, node, templatePart.rawName, templatePart.strings);
    }
    return defaultPartCallback(instance, templatePart, node);
};
export class PropertyPart extends AttributePart {
    setValue(values, startIndex) {
        const s = this.strings;
        let value;
        if (s.length === 2 && s[0] === '' && s[1] === '') {
            // An expression that occupies the whole attribute value will leave
            // leading and trailing empty strings.
            value = getValue(this, values[startIndex]);
        }
        else {
            // Interpolation, so interpolate
            value = this._interpolate(values, startIndex);
        }
        this.element[this.name] = value;
    }
}
export class EventPart {
    constructor(instance, element, eventName) {
        this.instance = instance;
        this.element = element;
        this.eventName = eventName;
    }
    setValue(value) {
        const listener = getValue(this, value);
        const previous = this._listener;
        if (listener === previous) {
            return;
        }
        this._listener = listener;
        if (previous != null) {
            this.element.removeEventListener(this.eventName, previous);
        }
        if (listener != null) {
            this.element.addEventListener(this.eventName, listener);
        }
    }
}
//# sourceMappingURL=lit-extended.js.map