// Lumio - Main JS
(function(){
    const pricing = {
        250000: { financing: 190961, others: 78750, lumio: 37500 },
        500000: { financing: 381923, others: 157500, lumio: 75000 },
        750000: { financing: 572885, others: 236250, lumio: 112500 },
        1000000: { financing: 763847, others: 315000, lumio: 150000 }
    };

    const fmt = n => 'R$ ' + n.toLocaleString('pt-BR');
    const fmtCredit = n => 'R$' + (n * 1000).toLocaleString('pt-BR');
    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    document.addEventListener('DOMContentLoaded', () => {
        // Value selector with type support
        const imovelValues = [200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000];
        const veiculoValues = [80, 100, 120, 140, 160, 180, 200, 250, 300, 400];

        let currentType = 'imovel';
        let currentValues = imovelValues;
        let currentIndex = 2; // Start at 400 for imovel

        const display = $('.value-amount');
        const simLink = $('#simulatorLink');

        const updateDisplay = () => {
            const val = currentValues[currentIndex];
            if(display) display.textContent = fmtCredit(val);
            if(simLink) simLink.href = `/simulator?v=${val * 1000}&t=${currentType}`;
        };

        const updateVal = (delta) => {
            if(delta < 0 && currentIndex > 0) currentIndex--;
            if(delta > 0 && currentIndex < currentValues.length - 1) currentIndex++;
            updateDisplay();
        };

        // Type selector buttons
        const valueSection = $('#valueSection');

        $$('.type-selector .btn-option-outline').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.type-selector .btn-option-outline').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentType = btn.dataset.type;

                if(currentType === 'imovel') {
                    currentValues = imovelValues;
                    currentIndex = 2; // Default to 400
                } else {
                    currentValues = veiculoValues;
                    currentIndex = 3; // Default to 140
                }

                // Show value section
                if(valueSection) valueSection.style.display = 'block';
                updateDisplay();
            });
        });

        // Value buttons
        $$('.value-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                updateVal(btn.classList.contains('minus-btn') ? -1 : 1);
            });
        });

        // Initialize simulator link and display
        updateDisplay();

        // Parcela type toggle
        $$('.parcela-option').forEach(option => {
            option.addEventListener('click', () => {
                $$('.parcela-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                option.querySelector('input').checked = true;
                
                const isIntegral = option.querySelector('input').value === 'integral';
                $$('.flex-col').forEach(el => el.style.display = isIntegral ? 'none' : '');
                $$('.integral-col').forEach(el => el.style.display = isIntegral ? '' : 'none');
            });
        });

        // Initialize parcela columns (show flex, hide integral)
        $$('.integral-col').forEach(el => el.style.display = 'none');

        // Pricing calculator
        $$('.price-btn').forEach(btn => {
            btn.onclick = function() {
                $$('.price-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const v = +this.dataset.value, d = pricing[v];
                if(!d) return;
                $('#creditValue').textContent = v.toLocaleString('pt-BR');
                $('#financingAmount').textContent = fmt(d.financing);
                $('#othersAmount').textContent = fmt(d.others);
                $('#lumioAmount').textContent = fmt(d.lumio);
            };
        });

        // FAQ accordion
        $$('.faq-item').forEach(item => {
            item.querySelector('button').onclick = () => {
                const open = item.classList.contains('open');
                $$('.faq-item').forEach(i => i.classList.remove('open'));
                if(!open) item.classList.add('open');
            };
        });

        // Timeline animation
        const timelineProgress = $('#timelineProgress');
        const timelineLight = $('#timelineLight');
        const stepsTimeline = $('.steps-timeline');
        const stepItems = $$('.step-item');

        if(timelineProgress && timelineLight && stepsTimeline && stepItems.length) {
            const updateTimeline = () => {
                const rect = stepsTimeline.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const triggerPoint = viewportHeight * 0.4;
                
                const totalHeight = rect.height;
                const scrolled = triggerPoint - rect.top;
                const progress = Math.max(0, Math.min(1, scrolled / totalHeight));
                
                timelineProgress.style.height = (progress * 100) + '%';
                timelineLight.style.top = (progress * (totalHeight - 14)) + 'px';
                
                stepItems.forEach((item, i) => {
                    const stepProgress = (i + 0.5) / stepItems.length;
                    item.classList.toggle('active', progress >= stepProgress - 0.1);
                });
            };

            window.addEventListener('scroll', updateTimeline, {passive: true});
            updateTimeline();
        }
    });
})();