// client-quiz.js
const quizSections = [
    {
        title: "Personal Information",
        questions: [
            {
                id: "clientId",
                type: "text",
                question: "Client ID",
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
            }
        ]
    },
    {
        title: "Contact Details",
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
                id: "address",
                type: "textarea",
                question: "What is your residential address (street, city, state, zip code, and country)?",
                required: true
            }
        ]
    },
    {
        title: "Employment Details",
        questions: [
            {
                id: "employer",
                type: "text",
                question: "Who is your employer?",
                required: true
            },
            {
                id: "position",
                type: "text",
                question: "What is your position or job title?",
                required: true
            },
            {
                id: "annualIncome",
                type: "number",
                question: "What is your annual income?",
                required: true
            },
            {
                id: "employmentStatus",
                type: "select",
                question: "What is your employment status?",
                options: ["Full-time", "Part-time", "Self-employed", "Unemployed"],
                required: true
            },
            {
                id: "yearsEmployed",
                type: "number",
                question: "How many years have you been with your current employer?",
                required: true
            }
        ]
    },
    {
        title: "Financial Profile - Assets",
        questions: [
            {
                id: "cashAmount",
                type: "number",
                question: "How much cash do you currently have?",
                required: true
            },
            {
                id: "savings",
                type: "number",
                question: "What is the total amount in your savings?",
                required: true
            },
            {
                id: "stocksValue",
                type: "number",
                question: "What is the total value of your investments in stocks?",
                required: true
            },
            {
                id: "bondsValue",
                type: "number",
                question: "What is the total value of your investments in bonds?",
                required: true
            },
            {
                id: "mutualFundsValue",
                type: "number",
                question: "What is the total value of your investments in mutual funds?",
                required: true
            },
            {
                id: "realEstateValue",
                type: "number",
                question: "What is the current value of your real estate assets?",
                required: true
            },
            {
                id: "otherAssets",
                type: "number",
                question: "Do you have any other assets? If so, what is their total value?",
                required: false
            }
        ]
    },
    {
        title: "Financial Profile - Liabilities",
        questions: [
            {
                id: "mortgageBalance",
                type: "number",
                question: "What is the current balance of your mortgage?",
                required: true
            },
            {
                id: "carLoanBalance",
                type: "number",
                question: "What is the current balance of your car loan?",
                required: true
            },
            {
                id: "creditCardDebt",
                type: "number",
                question: "What is the total amount of your credit card debt?",
                required: true
            },
            {
                id: "studentLoans",
                type: "number",
                question: "What is the remaining balance of your student loans?",
                required: true
            }
        ]
    },
    {
        title: "Investment Preferences",
        questions: [
            {
                id: "riskTolerance",
                type: "select",
                question: "What is your risk tolerance?",
                options: ["Low", "Moderate", "High"],
                required: true
            },
            {
                id: "investmentPreference",
                type: "select",
                question: "What are your preferred types of assets for investments?",
                options: ["Stocks", "Bonds", "Mutual Funds", "Real Estate", "Commodities"],
                required: true
            },
            {
                id: "diversificationImportance",
                type: "select",
                question: "How important is diversification to you?",
                options: ["Low", "Moderate", "High"],
                required: true
            },
            {
                id: "ethicalInvesting",
                type: "select",
                question: "Do you prefer ethical investing?",
                options: ["Yes", "No", "No preference"],
                required: true
            }
        ]
    }
];

class ClientQuiz {
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
                input.value = this.answers[id];
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
            const input = document.getElementById(q.id);
            if (input) {
                this.answers[q.id] = input.value;
            }
        });
    }

    submitQuiz() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        Database.saveQuizData(currentUser.id, this.answers);
        window.location.href = 'client-portal.html';
    }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ClientQuiz();
});
