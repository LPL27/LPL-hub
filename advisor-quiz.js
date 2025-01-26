const quizSections = [
    {
        title: "Personal Information",
        questions: [
            {
                id: "brokerId",
                type: "text",
                question: "Broker ID",
                required: true
            },
            {
                id: "firstName",
                type: "text",
                question: "What is your first name?",
                required: true
            },
            {
                id: "lastName",
                type: "text",
                question: "What is your last name?",
                required: true
            },
            {
                id: "dob",
                type: "date",
                question: "What is your date of birth?",
                required: true
            },
            {
                id: "gender",
                type: "select",
                question: "What is your gender?",
                options: ["Male", "Female", "Other", "Prefer not to say"],
                required: true
            },
            {
                id: "maritalStatus",
                type: "select",
                question: "What is your marital status?",
                options: ["Single", "Married", "Divorced", "Widowed"],
                required: true
            },
            {
                id: "languages",
                type: "checkbox",
                question: "What languages do you speak?",
                options: ["English", "Spanish", "French", "Mandarin", "Other"],
                required: true
            }
        ]
    },
    {
        title: "Contact Information",
        questions: [
            {
                id: "email",
                type: "email",
                question: "What is your email address?",
                required: true
            },
            {
                id: "phone",
                type: "tel",
                question: "What is your phone number?",
                required: true
            },
            {
                id: "officeAddress",
                type: "textarea",
                question: "What is your office address (street, city, state, zip code, and country)?",
                required: true
            },
            {
                id: "website",
                type: "url",
                question: "Do you have a personal or professional website? If yes, what is the URL?",
                required: false
            }
        ]
    },
    {
        title: "Licensing and Certifications",
        questions: [
            {
                id: "licenses",
                type: "textarea",
                question: "Do you hold any financial licenses? If yes, what are they, and who issued them?",
                required: true
            },
            {
                id: "licenseExpiry",
                type: "textarea",
                question: "When were your licenses issued, and when do they expire?",
                required: true
            },
            {
                id: "certifications",
                type: "textarea",
                question: "Do you have any certifications? If yes, what are they, and who issued them?",
                required: true
            }
        ]
    },
    {
        title: "Services Offered",
        questions: [
            {
                id: "investmentAdvisory",
                type: "select",
                question: "Do you offer investment advisory services?",
                options: ["Yes", "No"],
                required: true
            },
            {
                id: "portfolioManagement",
                type: "select",
                question: "Do you provide portfolio management services?",
                options: ["Yes", "No"],
                required: true
            },
            {
                id: "retirementPlanning",
                type: "select",
                question: "Do you assist with retirement planning?",
                options: ["Yes", "No"],
                required: true
            },
            {
                id: "taxPlanning",
                type: "select",
                question: "Do you offer tax planning or estate planning services?",
                options: ["Yes", "No"],
                required: true
            },
            {
                id: "insurance",
                type: "select",
                question: "Do you broker insurance?",
                options: ["Yes", "No"],
                required: true
            }
        ]
    },
    {
        title: "Clientele",
        questions: [
            {
                id: "clientTypes",
                type: "checkbox",
                question: "What types of clients do you typically work with?",
                options: ["Individual investors", "High Net Worth Individuals", "Institutional clients", "Other"],
                required: true
            },
            {
                id: "averagePortfolio",
                type: "number",
                question: "What is the average portfolio size of your clients?",
                required: true
            },
            {
                id: "clientCount",
                type: "number",
                question: "How many clients do you currently have?",
                required: true
            }
        ]
    },
    {
        title: "Performance Metrics",
        questions: [
            {
                id: "returns2020",
                type: "number",
                question: "What were your yearly returns for 2020?",
                required: true
            },
            {
                id: "returns2021",
                type: "number",
                question: "What were your yearly returns for 2021?",
                required: true
            },
            {
                id: "returns2022",
                type: "number",
                question: "What were your yearly returns for 2022?",
                required: true
            },
            {
                id: "returns2023",
                type: "number",
                question: "What were your yearly returns for 2023?",
                required: true
            },
            {
                id: "retentionRate",
                type: "number",
                question: "What is your client retention rate?",
                required: true
            },
            {
                id: "satisfaction",
                type: "number",
                question: "What is your customer satisfaction score out of 10?",
                required: true
            }
        ]
    }
];

class AdvisorQuiz {
    constructor() {
        this.currentSection = 0;
        this.answers = {};
        this.init();
    }

    init() {
        this.renderSection();
        this.setupEventListeners();
    }

    renderSection() {
        const section = quizSections[this.currentSection];
        const container = document.querySelector('.quiz-section');
        
        container.innerHTML = `
            <h2>${section.title}</h2>
            <form id="sectionForm">
                ${section.questions.map(q => this.createQuestionHTML(q)).join('')}
                <div class="quiz-navigation">
                    ${this.currentSection > 0 ? '<button type="button" id="prevBtn">Previous</button>' : ''}
                    ${this.currentSection < quizSections.length - 1 
                        ? '<button type="button" id="nextBtn">Next</button>'
                        : '<button type="submit" id="submitBtn">Complete</button>'
                    }
                </div>
            </form>
        `;

        // Restore any previously saved answers
        Object.keys(this.answers).forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                if (input.type === 'checkbox') {
                    const savedValues = this.answers[id];
                    if (Array.isArray(savedValues)) {
                        savedValues.forEach(value => {
                            const checkbox = document.querySelector(`input[value="${value}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }
                } else {
                    input.value = this.answers[id];
                }
            }
        });
    }

    createQuestionHTML(question) {
        let inputHTML = '';
        
        switch(question.type) {
            case 'select':
                inputHTML = `
                    <select id="${question.id}" ${question.required ? 'required' : ''}>
                        <option value="">Select an option</option>
                        ${question.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                `;
                break;
            case 'checkbox':
                inputHTML = question.options.map(opt => `
                    <div class="checkbox-option">
                        <input type="checkbox" id="${question.id}_${opt}" name="${question.id}" value="${opt}">
                        <label for="${question.id}_${opt}">${opt}</label>
                    </div>
                `).join('');
                break;
            case 'textarea':
                inputHTML = `
                    <textarea id="${question.id}" ${question.required ? 'required' : ''}></textarea>
                `;
                break;
            default:
                inputHTML = `
                    <input type="${question.type}" id="${question.id}" 
                           ${question.required ? 'required' : ''}
                           ${question.type === 'number' ? 'min="0"' : ''}>
                `;
        }

        return `
            <div class="form-group">
                <label for="${question.id}">${question.question}</label>
                ${inputHTML}
            </div>
        `;
    }

    setupEventListeners() {
        document.addEventListener('click', e => {
            if (e.target.id === 'nextBtn') {
                this.saveCurrentAnswers();
                this.currentSection++;
                this.renderSection();
            } else if (e.target.id === 'prevBtn') {
                this.saveCurrentAnswers();
                this.currentSection--;
                this.renderSection();
            }
        });

        document.addEventListener('submit', e => {
            if (e.target.id === 'sectionForm') {
                e.preventDefault();
                this.saveCurrentAnswers();
                this.submitQuiz();
            }
        });
    }

    saveCurrentAnswers() {
        const section = quizSections[this.currentSection];
        section.questions.forEach(q => {
            if (q.type === 'checkbox') {
                const checkboxes = document.querySelectorAll(`input[name="${q.id}"]:checked`);
                this.answers[q.id] = Array.from(checkboxes).map(cb => cb.value);
            } else {
                const input = document.getElementById(q.id);
                if (input) {
                    this.answers[q.id] = input.value;
                }
            }
        });
    }

    submitQuiz() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        Database.saveQuizData(currentUser.id, this.answers);
        window.location.href = 'advisor-portal.html';
    }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdvisorQuiz();
});