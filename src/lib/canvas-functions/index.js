const callback_function = () => {
    console.log('callback executed');
}

import {Menu_Renderer} from './menu_renderer.js';

const closeMenu = () => {
    menu.close();   
}

const btns = [ //txt property must be an array
    {txt: ['AA'], callback: closeMenu},
    {txt: ['BB'], callback: callback_function},
    {txt: ['CC1', 'CC2', 'CC3'], callback: callback_function},
];

const canvas = document.querySelector('.canvas');

const menu = new Menu_Renderer('Title 12345', 'Subtitle', 'version xyz', btns, 300, 600, canvas);
menu.init();