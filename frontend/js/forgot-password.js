document.addEventListener('DOMContentLoaded', () => {
    const formForgot = document.getElementById('form-forgot');
    const passMain = document.getElementById('pass-main');
    const passConfirm = document.getElementById('pass-confirm');

    // Elementos DOM para reglas
    const ruleMin = document.getElementById('rule-min');
    const ruleUpper = document.getElementById('rule-upper');
    const ruleNum = document.getElementById('rule-num');
    const ruleSpec = document.getElementById('rule-spec');

    const validationState = {
        min: false,
        upper: false,
        num: false,
        spec: false
    };

    // Validar contraseña en tiempo real mientras escribe
    passMain.addEventListener('input', () => {
        const val = passMain.value;

        validationState.min = val.length >= 8;
        updateRuleUI(ruleMin, validationState.min);

        validationState.upper = /[A-Z]/.test(val);
        updateRuleUI(ruleUpper, validationState.upper);

        validationState.num = /[0-9]/.test(val);
        updateRuleUI(ruleNum, validationState.num);

        validationState.spec = /[!@#$%^&*(),.?":{}|<>]/.test(val);
        updateRuleUI(ruleSpec, validationState.spec);
    });

    function updateRuleUI(element, isValid) {
        if (isValid) {
            element.classList.remove('rule-invalid');
            element.classList.add('rule-valid');
        } else {
            element.classList.remove('rule-valid');
            element.classList.add('rule-invalid');
        }
    }

    // Manejar submit del formulario
    if (formForgot) {
        formForgot.addEventListener('submit', (e) => {
            e.preventDefault();

            const allRulesPassed = Object.values(validationState).every(isTrue => isTrue);

            if (!allRulesPassed) {
                alert('La nueva contraseña debe cumplir con todas las reglas de seguridad.');
                return;
            }

            if (passMain.value !== passConfirm.value) {
                alert('Las contraseñas no coinciden. Por favor verifica.');
                return;
            }

            alert('¡Tu contraseña ha sido actualizada con éxito!');
            window.location.href = 'login.html';
        });
    }
});