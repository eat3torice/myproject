from sqlalchemy.orm import Session

from app.model.images_model import Images
from app.schema.images_schema import ImagesCreate, ImagesUpdate
import logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class ImagesService:
    def __init__(self, db: Session):
        self.db = db

    def get_images(self, skip: int = 0, limit: int = 100, product_id: int = None, variation_id: int = None):
        query = self.db.query(Images)
        if product_id:
            query = query.filter(Images.ProductID == product_id)
        if variation_id:
            query = query.filter(Images.VariationID == variation_id)
        for idx, img in enumerate(query.all(), 1):
            logger.info(f"[{idx}] Image ID:{img.PK_Images} ProductID:{img.ProductID} VariationID:{img.VariationID} Default:{img.Set_Default} SRC:{img.Id_Image}")
        return query.offset(skip).limit(limit).all()
        

    def get_image_by_id(self, image_id: int):
        return self.db.query(Images).filter(Images.PK_Images == image_id).first()

    def create_image(self, image_data: ImagesCreate):
        db_image = Images(
            ProductID=image_data.ProductID,
            VariationID=image_data.VariationID,
            Id_Image=image_data.Id_Image,
            Set_Default=image_data.Set_Default,
        )
        self.db.add(db_image)
        self.db.commit()
        self.db.refresh(db_image)
        return db_image

    def update_image(self, image_id: int, image_data: ImagesUpdate):
        image = self.get_image_by_id(image_id)
        if not image:
            return None
        for key, value in image_data.dict(exclude_unset=True).items():
            setattr(image, key, value)
        self.db.commit()
        self.db.refresh(image)
        return image

    def delete_image(self, image_id: int):
        image = self.get_image_by_id(image_id)
        if not image:
            return False
        self.db.delete(image)
        self.db.commit()
        return True
