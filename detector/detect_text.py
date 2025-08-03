import os
import warnings
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Boolean, JSON
from sqlalchemy.orm import sessionmaker, declarative_base
from transformers import pipeline
import logging

warnings.filterwarnings("ignore", category=FutureWarning)
# 🔐 Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('detector.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Get values from .env
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")


# Setup ORM base
Base = declarative_base()

class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    enable_toxic_scan = Column(Boolean)

# Define Item model (like Entity in TypeORM)
class Item(Base):
    __tablename__ = 'items'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    brand_id = Column(Integer)
    category_id = Column(Integer)
    images = Column(JSON)
    is_adult_content = Column(Boolean, default=False)

# Create connection string
db_url = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
engine = create_engine(db_url)
Session = sessionmaker(bind=engine)
session = Session()

# 🔧 Configuration
# Load category IDs where scanning is enabled
enabled_categories = session.query(Category.id)\
    .filter(Category.enable_toxic_scan == True)\
    .all()

logger.info(f"Successfully retrieved {len(enabled_categories)} enabled categories")
logger.info(f"Enabled category IDs: {[cat.id for cat in enabled_categories]}")

# Convert list of tuples → list of IDs
category_ids = [cat.id for cat in enabled_categories]
logger.info(f"Converted to category IDs list: {category_ids}")

items = session.query(Item)\
    .filter(Item.brand_id.in_(category_ids))\
    .all()

# Load Hugging Face classifier
classifier = pipeline("text-classification", model="unitary/toxic-bert")

# 4. Check each product name
flagged = []
updated_count = 0
for item in items:
    result = classifier(item.name)[0]
    label = result['label'].upper()
    score = result['score']
    print(f"ID: {item.id} → Label: {label}, Score: {score:.2f}")

    # Update database based on score
    try:
        if score > 0.8:
            item.is_adult_content = True
            flagged.append({
                "id": item.id,
                "name": item.name,
                "score": score
            })
            logger.info(f"Updated item ID {item.id} - is_adult_content set to True (score: {score:.2f})")
        else:
            item.is_adult_content = False
            logger.info(f"Updated item ID {item.id} - is_adult_content set to False (score: {score:.2f})")

        session.add(item)
        updated_count += 1

    except Exception as e:
        logger.error(f"Error updating item ID {item.id}: {str(e)}")

# Commit all changes to database
try:
    session.commit()
    logger.info(f"Successfully committed {updated_count} database updates")
except Exception as e:
    logger.error(f"Error committing database changes: {str(e)}")
    session.rollback()

# Output flagged products
print("\nFlagged products:")
for item in flagged:
    print(f"- ID: {item['id']}, Name: {item['name']}, Score: {item['score']:.2f}")

print(f"\nTotal items updated in database: {updated_count}")