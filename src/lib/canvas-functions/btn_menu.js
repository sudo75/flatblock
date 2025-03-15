import {Btn} from './button.js';

class Btn_Menu {
    constructor(canvas, ctx, btns, x, y) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.btns = btns;
        this.btn_objects = [];
        this.btn_margin = 5;
        this.btn_dimensions = {
            width: 200,
            height: 50
        };
        this.menuX = x;
        this.menuY = y;
    }

    init() {
        this.canvas.style.pointerEvents = 'auto';
        this.draw();

        this.hover_listener = this.hover_listener.bind(this);
        this.canvas.addEventListener('mousemove', this.hover_listener);
    }
    draw() {
        for (let i = 0; i < this.btns.length; i++) {
            const btnWidth = this.btn_dimensions.width;
            const btnHeight = this.btn_dimensions.height;
            const btnX = this.menuX;
            const btnY = this.menuY + i * (btnHeight + 2 * this.btn_margin);

            const callback_function = this.btns[i].callback;
            const btn = new Btn(this.canvas, this.ctx, btnX, btnY, btnWidth, btnHeight, this.btns[i].txt, callback_function);
            btn.init();

            this.btn_objects.push(btn);
        }

    }
    hover_listener(event) {
        this.canvas.style.cursor = 'default';

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        for (let i = 0; i < this.btn_objects.length; i++) {
            if (
                (mouseX >= this.btn_objects[i].bounds.x && mouseX <= this.btn_objects[i].bounds.x + this.btn_objects[i].bounds.width) &&
                (mouseY >= this.btn_objects[i].bounds.y && mouseY <= this.btn_objects[i].bounds.y + this.btn_objects[i].bounds.height)
            ) {
                this.canvas.style.cursor = 'pointer';
            }
        }
    }

    removeListeners() {
        this.canvas.removeEventListener('mousemove', this.hover_listener);
        this.btn_objects.forEach(btn_obj => {
            btn_obj.removeListeners();
        });
        this.canvas.style.cursor = 'default';
    }
}

export { Btn_Menu };