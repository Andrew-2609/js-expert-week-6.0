export default class View {
    constructor() {
        this.btnStart = document.getElementById('start');
        this.btnStop = document.getElementById('stop');

        this.buttons = () => Array.from(document.querySelectorAll('button'));

        this.ignoredButtons = new Set(['unassigned']);

        async function onBtnClick() { };
        this.onBtnClick = onBtnClick;
    }

    onLoad() {
        this.changeCommandButtonsVisibility();
        this.btnStart.onclick = this.onStartButtonClicked.bind(this);
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

    configureOnBtnClick(fn) {
        this.onBtnClick = fn;
    }

    async onStartButtonClicked({
        srcElement: { innerText }
    }) {
        const btnText = innerText;
        await this.onBtnClick(btnText);
        this.toggleBtnStart();
        this.changeCommandButtonsVisibility(false);

        this.buttons()
            .filter(btn => !this.isUnassigned(btn))
            .forEach(this.setupBtnAction.bind(this));
    }

    onStopButtonClicked({
        srcElement: { innerText }
    }) {
        this.toggleBtnStart(false);
        this.changeCommandButtonsVisibility(true);
        return this.onBtnClick(innerText);
    }

    setupBtnAction(btn) {
        const text = btn.innerText.toLowerCase();
        if (text.includes('start')) return;

        if (text.includes('stop')) {
            btn.onclick = this.onStopButtonClicked.bind(this);
            return;
        }
    }

    isUnassigned(btn) {
        const classes = Array.from(btn.classList);
        return (!!classes.find(className => this.ignoredButtons.has(className)));
    }

    toggleBtnStart(active = true) {
        if (active) {
            this.btnStart.classList.add('hidden');
            this.btnStop.classList.remove('hidden');
            return;
        }

        this.btnStart.classList.remove('hidden');
        this.btnStop.classList.add('hidden');
    }
};