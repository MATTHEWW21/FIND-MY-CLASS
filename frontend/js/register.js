document.addEventListener('DOMContentLoaded', () => {
    const formRegister = document.getElementById('form-register');
    const passMain = document.getElementById('pass-main');
    const passConfirm = document.getElementById('pass-confirm');

    // Elementos del DOM para las reglas
    const ruleMin = document.getElementById('rule-min');
    const ruleUpper = document.getElementById('rule-upper');
    const ruleNum = document.getElementById('rule-num');
    const ruleSpec = document.getElementById('rule-spec');

    // Estado de las reglas
    const validationState = {
        min: false,
        upper: false,
        num: false,
        spec: false
    };

    // Validar en tiempo real mientras escribe la contraseña
    passMain.addEventListener('input', () => {
        const val = passMain.value;

        // 1. Mínimo 8 caracteres
        validationState.min = val.length >= 8;
        updateRuleUI(ruleMin, validationState.min);

        // 2. Al menos una mayúscula
        validationState.upper = /[A-Z]/.test(val);
        updateRuleUI(ruleUpper, validationState.upper);

        // 3. Al menos un número
        validationState.num = /[0-9]/.test(val);
        updateRuleUI(ruleNum, validationState.num);

        // 4. Al menos un carácter especial
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

    // Validación al enviar el formulario
    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();

            // Verificar que todas las reglas se cumplan
            const allRulesPassed = Object.values(validationState).every(isTrue => isTrue);

            if (!allRulesPassed) {
                alert('La contraseña no cumple con todos los requisitos de seguridad.');
                return;
            }

            // Verificar que coincidan ambas contraseñas
            if (passMain.value !== passConfirm.value) {
                alert('Las contraseñas no coinciden. Por favor verifica.');
                return;
            }

            // Si todo está correcto, avanza a la verificación
            window.location.href = 'verify.html';
        });
    }
});