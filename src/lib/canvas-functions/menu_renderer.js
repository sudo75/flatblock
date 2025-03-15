import {Btn_Menu} from './btn_menu.js';

class Menu_Renderer {
    constructor(title, subtitle, version, btns, width, height, canvas) {
        this.title = title;
        this.subtitle = subtitle;
        this.btns = btns;
        this.font = {
            title: {style: 'bold', size: 32, typeface: 'IBM Plex Serif'},
            subtitle: {style: 'italic', size: 16, typeface: 'Arial'},
            version: {style: 'bold', size: 16, typeface: 'Arial'}
        };

        this.version = version;
        
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        this.width = width;
        this.height = height;

        this.btn_menu = null;

        this.isOpen = false;
    }
    init() {
        this.canvas.style.pointerEvents = 'default';

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        if (this.subtitle === null) {
            this.font.subtitle.size = 0;
        }
        if (this.version === null) {
            this.font.version.size = 0;
        }
    
        //Title
        const titleX = this.canvas.width / 2;
        const titleY = 20 + this.font.title.size / 2;

        this.ctx.font = `${this.font.title.style} ${this.font.title.size}px ${this.font.title.typeface}`;
        this.ctx.fillText(this.title, titleX, titleY);

        //Subtitle
        const subtitleX = this.canvas.width / 2;
        const subtitleY = 20 + titleY + this.font.subtitle.size / 2;

        this.ctx.font = `${this.font.subtitle.style} ${this.font.subtitle.size}px ${this.font.subtitle.typeface}`;
        this.ctx.fillText(this.subtitle, subtitleX, subtitleY);

        //Version
        this.ctx.textAlign = 'left';
        const versionX = 10;
        const versionY = this.canvas.height - this.font.version.size;

        this.ctx.font = `${this.font.version.style} ${this.font.version.size}px ${this.font.version.typeface}`;
        this.ctx.fillText(this.version, versionX, versionY);

        //Menu
        const menuY = subtitleY + this.font.subtitle.size + 10;
        const menu = new Btn_Menu(this.canvas, this.ctx, this.btns, 10, menuY);

        this.btn_menu = menu;

        menu.btn_dimensions.width = this.canvas.width - 20; //margin of 10 on each side
        menu.init();

        this.isOpen = true;
    }

    close() {
        this.canvas.style.pointerEvents = 'none';
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.btn_menu.removeListeners();
        
        this.isOpen = false;
    }
}

export { Menu_Renderer };