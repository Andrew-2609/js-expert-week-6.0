import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { JSDOM } from 'jsdom';
import View from '../../../public/controller/js/view.js';

describe('# View - test suite for presentation layer', () => {
    const dom = new JSDOM();

    const defaultBtnAttributes = {
        text: '',
        classList: { add: jest.fn(), remove: jest.fn() }
    };

    global.document = dom.window.document;
    global.window = dom.window;

    function makeBtnElement({
        text,
        classList
    } = defaultBtnAttributes) {
        return {
            onClick: jest.fn(),
            classList: classList,
            innerText: text
        };
    }

    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();

        jest.spyOn(
            document,
            document.getElementById.name
        ).mockReturnThis(makeBtnElement());
    });

    test('#changeCommandButtonsVisibility - given hide=true it should add unassigned class and reset on click', () => {
        const view = new View();
        const btn = makeBtnElement();

        jest.spyOn(
            document,
            document.querySelectorAll.name
        ).mockReturnValue([btn]);

        view.changeCommandButtonsVisibility();

        expect(btn.classList.add).toHaveBeenCalledWith('unassigned');
        expect(btn.onClick.name).toStrictEqual('onClickReset');
        expect(() => btn.onClick()).not.toThrow();
    });
    test.todo('#changeCommandButtonsVisibility - given hide=false it should remove unassigned class and reset on click');
    test.todo('#onLoad');
});