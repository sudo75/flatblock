class Btn {
    constructor(canvas, ctx, x, y, width, height, txt, callback) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.txt = txt;
        this.currentTextIndex = 0;
        this.status = {
            hover: false,
            mouseDown: false
        };
        this.bounds = {
            x: x,
            y: y,
            width: width,
            height: height
        };
        this.btnScaling = {
            hover: 1.02,
            mouseDown: 0.98
        }
        this.possibleBounds = {
            default: {
                x: x,
                y: y,
                width: width,
                height: height
            },
            hover: {
                x: x - (width * this.btnScaling.hover - width) / 2,
                y: y - (height * this.btnScaling.hover - height) / 2,
                width: width * this.btnScaling.hover,
                height: height * this.btnScaling.hover
            },
            mouseDown: {
                x: x - (width * this.btnScaling.mouseDown - width) / 2,
                y: y - (height * this.btnScaling.mouseDown - height) / 2,
                width: width * this.btnScaling.mouseDown,
                height: height * this.btnScaling.mouseDown
            }
        };
        this.callback = callback;
        this.fillColour = 'lightgrey';
        this.listeners = [];
    }

    removeListeners() {
        this.listeners.forEach(listener => {
            this.canvas.removeEventListener(listener.type, listener.callback);
        });
    }

    init() {
        this.draw();

        this.hover_listener = this.hover_listener.bind(this);
        this.canvas.addEventListener('mousemove', this.hover_listener);

        this.mouseDown_listener = this.mouseDown_listener.bind(this);
        this.canvas.addEventListener('mousedown', this.mouseDown_listener);

        this.mouseUp_listener = this.mouseUp_listener.bind(this);
        this.canvas.addEventListener('mouseup', this.mouseUp_listener);

        this.click_listener = this.click_listener.bind(this);
        this.canvas.addEventListener('mouseup', this.click_listener);

        this.listeners = [
            {type: 'mousemove', callback: this.hover_listener},
            {type: 'mousedown', callback: this.mouseDown_listener},
            {type: 'mouseup', callback: this.mouseUp_listener},
            {type: 'mouseup', callback: this.click_listener}
        ];
    }

    click_listener(event) {
        if (this.isMouseColliding(event)) {
            //Update btn text
            this.currentTextIndex = this.currentTextIndex >= this.txt.length - 1 ? 0: this.currentTextIndex + 1;
            this.draw();

            this.callback();
        }
    }

    mouseDown_listener(event) {
        if (this.isMouseColliding(event)) {
            this.status.mouseDown = true;
        } else {
            this.status.mouseDown = false;
        }
        this.draw();
    }

    mouseUp_listener(event) {
        this.status.mouseDown = false;
        this.draw();
    }

    hover_listener(event) {
        if (this.isMouseColliding(event)) {
            this.status.hover = true;
            //this.canvas.style.cursor = 'pointer';
        } else {
            this.status.hover = false;
            //this.canvas.style.cursor = 'default'; //cursor styling must be global bc. it will be overwritten by other buttons
        }
        this.draw();
    }

    isMouseColliding(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        return (
            (mouseX >= this.bounds.x && mouseX <= this.bounds.x + this.bounds.width) &&
            (mouseY >= this.bounds.y && mouseY <= this.bounds.y + this.bounds.height)
        );
    }

    draw() {
        this.ctx.clearRect(this.bounds.x - 2, this.bounds.y - 2, this.bounds.width + 4, this.bounds.height + 4);

        if (this.status.mouseDown) {
            this.bounds = this.possibleBounds.mouseDown;
        } else if (this.status.hover) {
            this.bounds = this.possibleBounds.hover;
        } else {
            this.bounds = this.possibleBounds.default;
        }

        //Draw btn
        this.ctx.beginPath();
        this.ctx.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
        this.ctx.fillStyle = this.fillColour;
        this.ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();

        //Text
        this.ctx.font = '16px Arial';  // Adjust font size as needed
        this.ctx.fillStyle = 'black';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle'; // Centers text vertically
    
        // Calculate text position (center of the button)
        const textX = this.bounds.x + this.bounds.width / 2;
        const textY = this.bounds.y + this.bounds.height / 2;
    
        // Draw the text (centered)
        this.ctx.fillText(this.txt[this.currentTextIndex], textX, textY);
    }
}

export { Btn };