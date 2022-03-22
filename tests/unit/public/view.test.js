import { beforeEach, describe, jest, test } from '@jest/globals';
import { JSDOM } from 'jsdom';

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

    test.todo('#changeCommandButtonsVisibility - given hide=true it should add unassigned class and reset on click');
    test.todo('#changeCommandButtonsVisibility - given hide=false it should remove unassigned class and reset on click');
    test.todo('#onLoad');
});