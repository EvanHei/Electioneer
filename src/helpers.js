// toggles UI updates between active tabs
export function activateTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
}
