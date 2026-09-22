-- Rôles et statuts
CREATE TYPE user_role AS ENUM ('client', 'technicien');
CREATE TYPE ticket_status AS ENUM ('en_attente', 'en_cours', 'resolu');
CREATE TYPE intervention_type AS ENUM ('chat', 'audio', 'video', 'partage_ecran');

-- Comptes utilisateur et technicien
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    disponible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Demandes d'assistance
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id),
    technicien_id INTEGER REFERENCES users(id),
    categorie VARCHAR(50),
    description TEXT NOT NULL,
    status ticket_status DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id),
    expediteur_id INTEGER NOT NULL REFERENCES users(id),
    contenu TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fichiers partagés (référence vers MinIO)
CREATE TABLE fichiers (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id),
    uploader_id INTEGER NOT NULL REFERENCES users(id),
    cle_objet_minio VARCHAR(255) NOT NULL,
    nom_original VARCHAR(255) NOT NULL,
    taille_octets BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Historique des interventions
CREATE TABLE interventions (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id),
    type intervention_type NOT NULL,
    duree_secondes INTEGER,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP
);