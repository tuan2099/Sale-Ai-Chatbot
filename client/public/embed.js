(function () {
    const script = document.currentScript;
    const storeId = new URL(script.src).searchParams.get('id');

    if (!storeId) {
        console.error('Sale Chatbot: Missing store id in script source.');
        return;
    }

    const container = document.createElement('div');
    container.id = 'sale-chatbot-container';
    document.body.appendChild(container);

    const iframe = document.createElement('iframe');
    iframe.src = `http://localhost:3000/widget/${storeId}`;
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.width = '420px';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.style.zIndex = '999999';
    iframe.style.background = 'transparent';

    // Initial state: just the button
    iframe.style.width = '100px';
    iframe.style.height = '100px';

    window.addEventListener('message', (event) => {
        if (event.data === 'CHAT_OPEN') {
            iframe.style.width = '420px';
            iframe.style.height = '600px';
        } else if (event.data === 'CHAT_CLOSE') {
            iframe.style.width = '100px';
            iframe.style.height = '100px';
        }
    });

    container.appendChild(iframe);
})();
