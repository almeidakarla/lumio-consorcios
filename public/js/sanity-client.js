// Sanity Client - Fetches content from Sanity CMS
const SanityClient = {
    projectId: 'f20cmcnt',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: true,

    // Build the API URL
    buildUrl(query) {
        const encoded = encodeURIComponent(query);
        return `https://${this.projectId}.api.sanity.io/v${this.apiVersion}/data/query/${this.dataset}?query=${encoded}`;
    },

    // Fetch data from Sanity
    async fetch(query) {
        try {
            const response = await fetch(this.buildUrl(query));
            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('Sanity fetch error:', error);
            return null;
        }
    },

    // Get image URL from Sanity image reference
    imageUrl(image, width = 800) {
        if (!image || !image.asset || !image.asset._ref) return null;
        const ref = image.asset._ref;
        const [, id, dimensions, format] = ref.split('-');
        return `https://cdn.sanity.io/images/${this.projectId}/${this.dataset}/${id}-${dimensions}.${format}?w=${width}&auto=format`;
    }
};

// Content Loader - Loads and applies content to the page
const ContentLoader = {
    // Load all content
    async loadAll() {
        const [
            settings,
            hero,
            steps,
            plans,
            differentials,
            faqs,
            consorcioOptions
        ] = await Promise.all([
            SanityClient.fetch(`*[_type == "siteSettings"][0]`),
            SanityClient.fetch(`*[_type == "heroSection"][0]`),
            SanityClient.fetch(`*[_type == "step"] | order(stepNumber asc)`),
            SanityClient.fetch(`*[_type == "pricingPlan"] | order(duration desc)`),
            SanityClient.fetch(`*[_type == "differential"] | order(order asc)`),
            SanityClient.fetch(`*[_type == "faq"] | order(order asc)`),
            SanityClient.fetch(`*[_type == "consorcioOption"] | order(order asc)`)
        ]);

        if (settings) this.applySettings(settings);
        if (hero) this.applyHero(hero);
        if (steps && steps.length) this.applySteps(steps);
        if (plans && plans.length) this.applyPlans(plans);
        if (differentials && differentials.length) this.applyDifferentials(differentials);
        if (faqs && faqs.length) this.applyFaqs(faqs);
        if (consorcioOptions && consorcioOptions.length) this.applyConsorcioOptions(consorcioOptions);
    },

    // Apply site settings
    applySettings(settings) {
        // Update WhatsApp links
        if (settings.whatsappNumber) {
            const waLinks = document.querySelectorAll('a[href*="wa.me"]');
            waLinks.forEach(link => {
                link.href = `https://wa.me/${settings.whatsappNumber}`;
            });
        }

        // Update meta tags
        if (settings.metaTitle) {
            document.title = settings.metaTitle;
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.content = settings.metaTitle;
        }

        if (settings.metaDescription) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.content = settings.metaDescription;
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.content = settings.metaDescription;
        }

        // Update footer
        if (settings.footerText) {
            const footerCopy = document.querySelector('.footer-copy');
            if (footerCopy) footerCopy.textContent = settings.footerText;
        }

        if (settings.disclaimer) {
            const disclaimer = document.querySelector('.footer-disclaimer');
            if (disclaimer) disclaimer.textContent = settings.disclaimer;
        }
    },

    // Apply hero section
    applyHero(hero) {
        const heroTag = document.querySelector('.hero-tag');
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroSection = document.querySelector('.hero');

        if (heroTag && hero.tag) heroTag.textContent = hero.tag;
        if (heroTitle && hero.title) heroTitle.textContent = hero.title;
        if (heroSubtitle && hero.subtitle) heroSubtitle.textContent = hero.subtitle;

        if (heroSection && hero.backgroundImage) {
            const imageUrl = SanityClient.imageUrl(hero.backgroundImage, 1920);
            if (imageUrl) {
                heroSection.style.backgroundImage = `url('${imageUrl}')`;
            }
        }
    },

    // Apply steps
    applySteps(steps) {
        const stepItems = document.querySelectorAll('.step-item');
        steps.forEach((step, i) => {
            if (stepItems[i]) {
                const titleEl = stepItems[i].querySelector('h3');
                const descEl = stepItems[i].querySelector('p');
                if (titleEl) titleEl.textContent = step.title;
                if (descEl) descEl.textContent = step.description;
            }
        });
    },

    // Apply pricing plans
    applyPlans(plans) {
        const container = document.querySelector('.plans-grid');
        if (!container) return;

        const fmt = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const fmtCredit = n => n.toLocaleString('pt-BR');

        container.innerHTML = plans.map(plan => `
            <div class="plan-card ${plan.isPopular ? 'popular' : ''}">
                <div class="plan-header">
                    <span class="plan-label">Plano</span>
                    ${plan.isPopular ? '<span class="plan-badge">Mais popular</span>' : ''}
                </div>
                <h3 class="plan-duration">${plan.duration} meses</h3>
                <p class="plan-desc">${plan.description || ''}</p>
                <table class="plan-table">
                    <thead>
                        <tr>
                            <th>Credito</th>
                            <th class="flex-col">Super Flex</th>
                            <th class="integral-col" style="display:none">Integral</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(plan.prices || []).map(price => `
                            <tr>
                                <td>R$ ${fmtCredit(price.credit)}</td>
                                <td class="flex-col text-primary">R$ ${fmt(price.superFlex)}</td>
                                <td class="integral-col" style="display:none">R$ ${fmt(price.integral)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `).join('');

        // Re-initialize parcela toggle for new elements
        this.reinitParcelaToggle();
    },

    // Apply differentials
    applyDifferentials(differentials) {
        const container = document.querySelector('#diferenciais .cards');
        if (!container) return;

        const iconMap = {
            users: '<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20v-1a4 4 0 014-4h8a4 4 0 014 4v1"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 20v-1a4 4 0 00-3-3.87"/></svg>',
            check: '<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            chart: '<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>'
        };

        container.innerHTML = differentials.map(diff => `
            <li>
                ${iconMap[diff.icon] || iconMap.users}
                <h3>${diff.title}</h3>
                <p>${diff.description}</p>
            </li>
        `).join('');
    },

    // Apply FAQs
    applyFaqs(faqs) {
        const container = document.querySelector('.faq');
        if (!container) return;

        container.innerHTML = faqs.map(faq => `
            <div class="faq-item">
                <dt>
                    <button>
                        <span>${faq.question}</span>
                        <span class="icon"></span>
                    </button>
                </dt>
                <dd>
                    <p>${faq.answer}</p>
                </dd>
            </div>
        `).join('');

        // Re-initialize FAQ accordion
        document.querySelectorAll('.faq-item').forEach(item => {
            item.querySelector('button').onclick = () => {
                const open = item.classList.contains('open');
                document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
                if (!open) item.classList.add('open');
            };
        });
    },

    // Apply consorcio options
    applyConsorcioOptions(options) {
        const container = document.querySelector('.options-grid');
        if (!container) return;

        const whatsappNumber = '5532998270651';

        container.innerHTML = options.map(option => {
            const imageUrl = SanityClient.imageUrl(option.image, 600);
            const whatsappMsg = encodeURIComponent(option.whatsappText || `Olá! Gostaria de saber mais sobre ${option.title}.`);

            return `
                <div class="option-card">
                    <div class="option-image">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${option.title}">` : ''}
                    </div>
                    <h3>${option.title}</h3>
                    <p>${option.description}</p>
                    <a href="${option.buttonLink || '#simulacao'}" class="btn-option-primary">${option.buttonText || 'Conheça o ' + option.title}</a>
                    <a href="https://wa.me/${whatsappNumber}?text=${whatsappMsg}" class="btn-option-outline" target="_blank" rel="noopener">Simule pelo WhatsApp</a>
                </div>
            `;
        }).join('');
    },

    // Re-initialize parcela toggle after dynamic content load
    reinitParcelaToggle() {
        document.querySelectorAll('.parcela-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.parcela-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                option.querySelector('input').checked = true;

                const isIntegral = option.querySelector('input').value === 'integral';
                document.querySelectorAll('.flex-col').forEach(el => el.style.display = isIntegral ? 'none' : '');
                document.querySelectorAll('.integral-col').forEach(el => el.style.display = isIntegral ? '' : 'none');
            });
        });
    }
};

// Load content when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ContentLoader.loadAll();
});
