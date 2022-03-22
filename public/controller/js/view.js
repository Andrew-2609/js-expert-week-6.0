export default class View {
    onLoad() {
        this.changeCommandButtonsVisibility();
    }

    changeCommandButtonsVisibility(hide = true) {
        Array.from(document.querySelectorAll('[name=command]'))
            .forEach(btn => {
                const fn = hide ? 'add' : 'remove';
                btn.classList[fn]('unassigned');
                function onClickReset() { }
                btn.onClick = onClickReset;
            });
    }
};