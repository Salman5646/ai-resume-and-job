"""
AINN SLA - Custom NumPy Neural Network Trainer
===============================================
Since the system is running 32-bit Python 3.14 (which lacks TensorFlow support),
this script implements a 4-layer feedforward neural network from scratch using
pure NumPy.

Math implemented:
- Xavier/He weight initialization
- Forward propagation (ReLU/Sigmoid)
- Backward propagation (Gradient Descent)
- Binary Cross-Entropy loss
- Weights saved as .npz (NumPy archive)

Usage:
  py train_model.py
"""

import os
import json
import numpy as np

# --- SKILLS VOCABULARY ---
SKILLS_VOCAB = [
    # Frontend
    "react", "html", "css", "javascript", "typescript", "nextjs", "tailwindcss",
    "vuejs", "angular", "redux", "webpack", "sass",
    # Backend Languages
    "nodejs", "python", "java", "csharp", "golang", "rust", "php", "ruby",
    # Backend Frameworks
    "express", "django", "flask", "spring", "dotnet", "fastapi",
    # Databases
    "sql", "nosql", "postgresql", "mongodb", "mysql", "redis",
    "elasticsearch", "dynamodb", "firebase", "sqlite",
    # APIs & Architecture
    "restapis", "graphql", "microservices", "websockets", "grpc",
    # DevOps & Cloud
    "docker", "kubernetes", "cicd", "aws", "azure", "gcp", "terraform",
    "jenkins", "linux", "nginx", "serverless", "ansible",
    "cloudarchitecture", "solutionarchitecture", "cloudnetworking",
    # Mobile
    "reactnative", "flutter", "swift", "kotlin", "android", "ios", "mobileappdevelopment",
    # ML & AI
    "tensorflow", "pytorch", "scikitlearn", "pandas", "numpy",
    "deeplearning", "nlp", "computervision", "machinelearning", "statistics",
    # Data Engineering
    "spark", "kafka", "airflow", "hadoop", "bigdata", "datascience",
    # BI & Analytics
    "tableau", "powerbi", "excel", "datavisualization", "reporting", "analytics",
    # Security
    "networking", "siem", "penetrationtesting", "securityoperations",
    "incidentresponse", "cryptography",
    # Design
    "figma", "adobexd", "wireframing", "prototyping", "userresearch",
    "interactiondesign", "uxdesign",
    # Management
    "agile", "scrum", "jira", "roadmapping", "stakeholdermanagement",
    "productmanagement", "userstories", "kanban",
    # General Engineering
    "git", "testing", "unittesting", "selenium", "jest", "cypress", "postman", "debugging",
]
VOCAB_SIZE = len(SKILLS_VOCAB)

# --- JOB CATALOG ---
JOB_CATALOG = [
    {"id":"1",  "title":"Frontend Developer",    "requiredSkills":["React","HTML","CSS","JavaScript","TypeScript","Next.js","Tailwind CSS"]},
    {"id":"2",  "title":"Backend Developer",     "requiredSkills":["Node.js","Python","SQL","REST APIs","Docker","PostgreSQL","MongoDB"]},
    {"id":"3",  "title":"Data Analyst",          "requiredSkills":["Python","SQL","Excel","Tableau","Power BI","Statistics","Data Visualization"]},
    {"id":"4",  "title":"ML Engineer",           "requiredSkills":["Python","TensorFlow","PyTorch","Scikit-learn","Deep Learning","NLP","Computer Vision"]},
    {"id":"5",  "title":"UI/UX Designer",        "requiredSkills":["Figma","Adobe XD","Wireframing","Prototyping","User Research","Interaction Design"]},
    {"id":"6",  "title":"DevOps Engineer",       "requiredSkills":["Docker","Kubernetes","CI/CD","AWS","Linux","Terraform","Jenkins"]},
    {"id":"7",  "title":"Mobile Developer",      "requiredSkills":["React Native","Flutter","Shift","Kotlin","Mobile App Development","Firebase"]},
    {"id":"8",  "title":"Data Engineer",         "requiredSkills":["Spark","Kafka","Airflow","SQL","Python","BigData","Hadoop"]},
    {"id":"9",  "title":"Cybersecurity Analyst", "requiredSkills":["Networking","SIEM","Penetration Testing","Security Operations","Incident Response"]},
    {"id":"10", "title":"Product Manager",       "requiredSkills":["Agile","Roadmapping","JIRA","Stakeholder Management","User Stories"]},
    {"id":"11", "title":"Cloud Architect",       "requiredSkills":["AWS","Azure","GCP","Terraform","Cloud Networking","Solution Architecture"]},
    {"id":"12", "title":"Full Stack Developer",  "requiredSkills":["React","Node.js","SQL","REST APIs","Git","TypeScript","Express"]},
]

# --- NUMPY NEURAL NETWORK CLASS ---
class NumPyNN:
    def __init__(self, layers: list, lr=0.01):
        self.lr = lr
        self.params = {}
        self.layers = layers
        
        # He Initialization
        for i in range(1, len(layers)):
            self.params[f'W{i}'] = np.random.randn(layers[i], layers[i-1]) * np.sqrt(2. / layers[i-1])
            self.params[f'b{i}'] = np.zeros((layers[i], 1))

    def relu(self, Z): return np.maximum(0, Z)
    def sigmoid(self, Z): return 1 / (1 + np.exp(-np.clip(Z, -500, 500)))
    
    def relu_prime(self, Z): return (Z > 0).astype(float)

    def forward(self, X):
        cache = {'A0': X}
        for i in range(1, len(self.layers)):
            Z = np.dot(self.params[f'W{i}'], cache[f'A{i-1}']) + self.params[f'b{i}']
            if i == len(self.layers) - 1:
                A = self.sigmoid(Z)
            else:
                A = self.relu(Z)
            cache[f'Z{i}'] = Z
            cache[f'A{i}'] = A
        return A, cache

    def backward(self, X, Y, cache):
        m = X.shape[1]
        grads = {}
        L = len(self.layers) - 1
        
        # Output layer gradient
        dA = - (np.divide(Y, cache[f'A{L}']) - np.divide(1 - Y, 1 - cache[f'A{L}']))
        dZ = cache[f'A{L}'] - Y # simplified for sigmoid + BCE
        
        for i in range(L, 0, -1):
            grads[f'dW{i}'] = (1/m) * np.dot(dZ, cache[f'A{i-1}'].T)
            grads[f'db{i}'] = (1/m) * np.sum(dZ, axis=1, keepdims=True)
            if i > 1:
                dA_prev = np.dot(self.params[f'W{i}'].T, dZ)
                dZ = dA_prev * self.relu_prime(cache[f'Z{i-1}'])
        return grads

    def update(self, grads):
        for i in range(1, len(self.layers)):
            self.params[f'W{i}'] -= self.lr * grads[f'dW{i}']
            self.params[f'b{i}'] -= self.lr * grads[f'db{i}']

    def save(self, path):
        np.savez(path, **self.params)

# --- DATA UTILS ---
def normalize(skill: str) -> str:
    return (skill.lower().replace(" ", "").replace(".", "").replace("-", "")
            .replace("/", "").replace("_", "").replace("+", ""))

def skill_to_vector(skills: list) -> np.ndarray:
    vec = np.zeros((VOCAB_SIZE, 1), dtype=np.float32)
    norms = [normalize(s) for s in skills]
    for i, v in enumerate(SKILLS_VOCAB):
        if v in norms: vec[i] = 1.0
    return vec

def generate_samples(n=5000):
    X, Y = [], []
    for _ in range(n):
        # Pick random job
        job = JOB_CATALOG[np.random.randint(len(JOB_CATALOG))]
        jv = skill_to_vector(job["requiredSkills"]).flatten()
        
        # Mix of matches
        kind = np.random.choice(["high", "mid", "low"])
        if kind == "high":
            # Start with job skills, drop 0-2
            skills = list(job["requiredSkills"])
            if len(skills) > 2:
                for _ in range(np.random.randint(0, 3)): skills.pop(np.random.randint(len(skills)))
            score = len(skills) / len(job["requiredSkills"])
        elif kind == "mid":
            # Half of job skills + random
            skills = list(job["requiredSkills"][:len(job["requiredSkills"])//2])
            skills.extend([SKILLS_VOCAB[i] for i in np.random.randint(0, VOCAB_SIZE, 5)])
            score = 0.4 + (np.random.random() * 0.3)
        else:
            # Completely random
            skills = [SKILLS_VOCAB[i] for i in np.random.randint(0, VOCAB_SIZE, 10)]
            score = np.random.random() * 0.3
            
        cv = skill_to_vector(skills).flatten()
        X.append(np.concatenate([cv, jv]))
        Y.append([score])
        
    return np.array(X).T, np.array(Y).T

# --- MAIN ---
if __name__ == "__main__":
    print("\n[NumPy NN] Training Custom Neural Network...")
    print(f"[NumPy NN] Vocab: {VOCAB_SIZE} | Input: {VOCAB_SIZE * 2}")
    
    # 1. Create Data
    X, Y = generate_samples(4000) # Reduced to 4k for speed
    
    # 2. Initialize Model
    nn = NumPyNN([VOCAB_SIZE * 2, 256, 128, 64, 1], lr=0.1)
    
    # 3. Train
    epochs = 100 # Fast setup
    batch_size = 64
    m = X.shape[1]
    
    for e in range(epochs):
        # Shuffle
        idx = np.random.permutation(m)
        X_s, Y_s = X[:, idx], Y[:, idx]
        
        # Mini-batch
        for i in range(0, m, batch_size):
            end = i + batch_size
            X_b, Y_b = X_s[:, i:end], Y_s[:, i:end]
            A, cache = nn.forward(X_b)
            grads = nn.backward(X_b, Y_b, cache)
            nn.update(grads)
            
        if e % 20 == 0:
            A_all, _ = nn.forward(X)
            loss = np.mean(np.square(A_all - Y))
            print(f"Batch Epoch {e} | Loss: {loss:.4f}", flush=True)

    # 4. Save
    os.makedirs("model", exist_ok=True)
    nn.save("model/resume_matcher_weights.npz")
    
    with open("model/metadata.json", "w") as f:
        json.dump({"vocab": SKILLS_VOCAB, "architecture": "256-128-64-1", "type": "numpy_native"}, f, indent=2)
        
    print("\n[NumPy NN] Model trained and saved.")
