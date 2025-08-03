import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
from transformers import pipeline

# 🔐 Load environment variables
load_dotenv()
# Get values from .env
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")


# Setup ORM base
Base = declarative_base()

# Define Item model (like Entity in TypeORM)
class Item(Base):
    __tablename__ = 'items'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    brand_id = Column(Integer)
    category_id = Column(Integer)

# Create connection string
db_url = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
engine = create_engine(db_url)
Session = sessionmaker(bind=engine)
session = Session()

# 🔧 Configuration
category_ids = [1, 2, 3]
brand_ids = [1, 20]

items = session.query(Item)\
    .filter(Item.category_id.in_(category_ids))\
    .filter(Item.brand_id.in_(brand_ids))\
    .all()

# Load Hugging Face classifier
classifier = pipeline("text-classification", model="unitary/toxic-bert")

# 4. Check each product name
flagged = []
for item in items:
    result = classifier(item.name)[0]
    label = result['label'].upper()
    score = result['score']
    print(f"ID: {item.id} → Label: {label}, Score: {score:.2f}")
    if label == "TOXIC" and score > 0.8:
        flagged.append({
            "id": item.id,
            "name": item.name,
            "score": score
        })

# Output flagged products
print("\nFlagged products:")
for item in flagged:
    print(f"- ID: {item['id']}, Name: {item['name']}, Score: {item['score']:.2f}")