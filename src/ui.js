/** HTML overlay UI helpers. */

const uiLayer = document.getElementById('ui-layer');

export const UI = {
    clear() {
        uiLayer.innerHTML = '';
        uiLayer.classList.remove('active');
    },

    showNameInput(callback) {
        uiLayer.classList.add('active');
        uiLayer.innerHTML = `
            <div class="overlay">
                <label>请输入你的名字：</label>
                <input type="text" id="name-input" maxlength="8" value="无名侠客">
                <button id="name-confirm">确定</button>
            </div>
        `;

        const input = document.getElementById('name-input');
        const btn = document.getElementById('name-confirm');
        input.focus();
        input.select();

        const submit = () => {
            const name = input.value.trim() || '无名侠客';
            this.clear();
            callback(name);
        };

        btn.addEventListener('click', submit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submit();
        });
    },

    showMessage(title, message, callback) {
        uiLayer.classList.add('active');
        uiLayer.innerHTML = `
            <div class="overlay">
                <h3>${title}</h3>
                <p>${message}</p>
                <button id="msg-confirm">确定</button>
            </div>
        `;
        document.getElementById('msg-confirm').addEventListener('click', () => {
            this.clear();
            if (callback) callback();
        });
    }
};
