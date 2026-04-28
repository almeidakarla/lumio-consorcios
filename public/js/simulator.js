// Simulator - Optimized JavaScript
(function() {
    'use strict';

    // Consorcio type configurations
    const configs = {
        imovel: {
            values: [200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1100000, 1200000, 1300000, 1400000, 1500000, 1600000, 1700000, 1800000, 1900000, 2000000],
            defaultIndex: 2,
            label: 'Imóvel',
            range: 'de R$ 200.000 até R$ 2.000.000',
            planMin: 150000,
            planStep: 50000
        },
        veiculo: {
            values: [80000, 100000, 120000, 140000, 160000, 180000, 200000, 250000, 300000, 400000],
            defaultIndex: 3,
            label: 'Veículo',
            range: 'de R$ 80.000 até R$ 400.000',
            planMin: 80000,
            planStep: 20000
        }
    };

    // Read URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlValue = parseInt(urlParams.get('v')) || null;
    const urlType = urlParams.get('t') || 'imovel';

    // Get config based on type
    const config = configs[urlType] || configs.imovel;

    // Find initial index based on URL value
    let currentIndex = config.defaultIndex;
    if (urlValue) {
        const idx = config.values.indexOf(urlValue);
        if (idx !== -1) currentIndex = idx;
    }

    // State
    let step = 1;
    let credit = config.values[currentIndex];
    let plan = credit;
    let term = 60;
    let name = '';

    // Format number
    const fmt = n => n.toLocaleString('pt-BR');
    const fmtCurrency = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Elements
    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        // Update UI based on type
        const typeBadge = $('#typeBadge');
        if (typeBadge) typeBadge.textContent = `Consórcio ${config.label === 'Imóvel' ? 'Imobiliário' : 'Veicular'}`;

        const subtitle = $('.step-subtitle');
        if (subtitle) subtitle.textContent = `Esse é o valor do crédito do seu consórcio Lumio ${config.label}.`;

        const rangeEl = $('.value-range');
        if (rangeEl) rangeEl.textContent = config.range;

        const creditDisplay = $('#creditAmount');
        if (creditDisplay) creditDisplay.textContent = fmt(credit);

        setupNavigation();
        setupCreditSelector();
        setupTermSelector();
        setupPlanBuilder();
        setupInputs();
        setupSubmit();
    }

    // Navigation
    function goTo(s) {
        $$('.step').forEach(el => el.classList.remove('active'));
        $(`[data-step="${s}"]`)?.classList.add('active');
        step = s;
        $('#backBtn').style.visibility = s > 1 ? 'visible' : 'hidden';

        if (s === 4 && name) {
            $('#userNameDisplay').textContent = name.split(' ')[0];
        }

        // Sync plan builder with previous selections when entering Step 5
        if (s === 5 && window.syncPlanBuilder) {
            window.syncPlanBuilder();
        }
    }

    function setupNavigation() {
        $$('[data-next]').forEach(btn => {
            btn.onclick = () => !btn.disabled && goTo(parseInt(btn.dataset.next));
        });
        
        $('#backBtn').onclick = () => step > 1 && goTo(step - 1);
    }

    // Credit Selector (Step 1)
    function setupCreditSelector() {
        const display = $('#creditAmount');
        const minus = $('[data-action="decrease"]');
        const plus = $('[data-action="increase"]');

        if (!display) return;

        minus.onclick = () => {
            if (currentIndex > 0) {
                currentIndex--;
                credit = config.values[currentIndex];
                display.textContent = fmt(credit);
            }
        };
        plus.onclick = () => {
            if (currentIndex < config.values.length - 1) {
                currentIndex++;
                credit = config.values[currentIndex];
                display.textContent = fmt(credit);
            }
        };
    }

    // Term Selector (Step 2)
    function setupTermSelector() {
        const termStepBtns = $$('.term-btn-step');
        const termNextBtn = $('#termNextBtn');

        if (!termStepBtns.length) return;

        termStepBtns.forEach(btn => {
            btn.onclick = () => {
                termStepBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                term = parseInt(btn.dataset.termStep);

                // Enable the continue button
                if (termNextBtn) {
                    termNextBtn.disabled = false;
                    termNextBtn.classList.remove('btn-disabled');
                }
            };
        });
    }

    // Plan Builder (Step 5)
    function setupPlanBuilder() {
        const planDisplay = $('#planAmount');
        const monthlyDisplay = $('#monthlyAmount');
        const minus = $('[data-action="decrease-plan"]');
        const plus = $('[data-action="increase-plan"]');
        const termBtns = $$('.term-btn');

        if (!planDisplay) return;

        function update() {
            planDisplay.textContent = fmt(plan);
            const monthly = (plan * 1.15) / term;
            monthlyDisplay.textContent = fmtCurrency(monthly);
        }

        function syncFromPreviousSteps() {
            // Sync plan amount with credit from Step 1
            plan = credit;
            planDisplay.textContent = fmt(plan);

            // Sync term buttons with selection from Step 2
            termBtns.forEach(btn => {
                btn.classList.remove('active');
                if (parseInt(btn.dataset.term) === term) {
                    btn.classList.add('active');
                }
            });

            update();
        }

        minus.onclick = () => { if (plan > config.planMin) { plan -= config.planStep; update(); }};
        plus.onclick = () => { if (plan < config.values[config.values.length - 1]) { plan += config.planStep; update(); }};

        termBtns.forEach(btn => {
            btn.onclick = () => {
                termBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                term = parseInt(btn.dataset.term);
                update();
            };
        });

        // Expose sync function for when entering Step 5
        window.syncPlanBuilder = syncFromPreviousSteps;

        update();
    }

    // Input Validation
    function setupInputs() {
        // Name
        const nameInput = $('#userName');
        const nameBtn = $('#nameNextBtn');
        if (nameInput && nameBtn) {
            nameInput.oninput = () => {
                name = nameInput.value.trim();
                const valid = name.length >= 2;
                nameBtn.disabled = !valid;
                nameBtn.classList.toggle('btn-disabled', !valid);
            };
        }

        // Phone
        const phoneInput = $('#userPhone');
        const phoneBtn = $('#phoneNextBtn');
        if (phoneInput && phoneBtn) {
            phoneInput.oninput = () => {
                let v = phoneInput.value.replace(/\D/g, '').slice(0, 11);
                if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2,7)}${v.length > 7 ? ' ' + v.slice(7) : ''}`;
                else if (v.length > 0) v = `(${v}`;
                phoneInput.value = v;
                
                const valid = v.replace(/\D/g, '').length >= 10;
                phoneBtn.disabled = !valid;
                phoneBtn.classList.toggle('btn-disabled', !valid);
            };
        }
    }

    // Submit
    function setupSubmit() {
        const submitBtn = $('#submitBtn');
        const modal = $('#successModal');
        const whatsappBtn = $('#whatsappBtn');
        
        if (!submitBtn) return;

        submitBtn.onclick = () => {
            $('#modalUserName').textContent = name.split(' ')[0] || 'Você';
            modal.classList.add('active');
        };

        whatsappBtn.onclick = (e) => {
            e.preventDefault();
            const phone = $('#userPhone')?.value || '';
            const msg = encodeURIComponent(
                `Olá! Fiz uma simulação no site.\n\n` +
                `Nome: ${name}\nTelefone: ${phone}\n\n` +
                `Crédito: R$ ${fmt(credit)}\nPlano: R$ ${fmt(plan)} em ${term}x\n\n` +
                `Quero mais informações!`
            );
            window.open(`https://wa.me/5532998270651?text=${msg}`, '_blank');
        };
    }
})();