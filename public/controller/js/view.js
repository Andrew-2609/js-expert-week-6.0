export default class View {
    constructor() {
        this.btnStart = document.getElementById('start');
        this.btnStop = document.getElementById('stop');
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