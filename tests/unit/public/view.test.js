import { describe, test } from '@jest/globals';
import { JSDOM } from 'jsdom';

describe('# View - test suite for presentation layer', () => {
    const dom = new JSDOM();
    global.document = dom.window.document;
    global.window = dom.window;

    test.todo('#changeCommandButtonsVisibility - given hide=true it should add unassigned class and reset on click');
    test.todo('#changeCommandButtonsVisibility - given hide=false it should remove unassigned class and reset on click');
    test.todo('#onLoad');
});