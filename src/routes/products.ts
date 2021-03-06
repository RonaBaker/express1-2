import { Request, Response, NextFunction, Router } from 'express';
import uuidv1 from 'uuid/v1';
import products from '../products.json';
import categories from '../categories.json';
import {Product} from '../models/product';
import {Category} from '../models/category';

const productRouter = Router();
const categoryRouter = Router();

function findProductIndex(req: Request, res: Response, next: NextFunction) {
  res.locals.elements = products;
  next();
}

function findCategoryIndex(req: Request, res: Response, next: NextFunction) {
  res.locals.elements = categories;
  next();
}

function findElementIndex(req: Request, res: Response, next: NextFunction) {
   const id = req.params.id;
   const matchingIndex = res.locals.elements.findIndex((o: typeof res.locals.elements) => o.id === id);
   if (matchingIndex < 0) {
     res.status(404).send('Not Found');
     return;
   }
   res.locals.matchingIndex = matchingIndex;
   res.locals.elementId = id;
   next();
}

productRouter.get('/products', (req, res) => {
    res.send(products);
  });

productRouter.get('/products/:id', checkIdLength, (req, res) => {
   const id = req.params.id;
   const matching = products.find(o => o.id === id);
   if (!matching) {
        res.status(404).send('product not found');
        return;
   }
   res.send(matching);
 });

productRouter.post('/products', checkNameLength, (req, res) => {
   const prod: Product = req.body;
   prod.id = uuidv1() ;
   products.push(prod);
   res.status(201).send(prod);
 });

productRouter.put('/products/:id', checkIdLength, checkNameLength, findProductIndex, findElementIndex, (req, res) => {
    const { elementId , matchingIndex } = res.locals;
    const prod: Product = req.body;
    prod.id = elementId;
    products[matchingIndex] = prod;
    res.send(prod);
   });

productRouter.delete('/products/:id', checkIdLength, findProductIndex, findElementIndex, (req, res) => {
    products.splice(res.locals.matchingIndex, 1);
    res.sendStatus(204);
   },
 );

categoryRouter.get('/categories', (req, res) => {
  res.send(categories);
});

categoryRouter.get('/categories/:id/products', checkIdLength, (req, res) => {
  const categoryId = req.params.id;
  const matchingCat = categories.find(o => o.id === categoryId);
  const matchingProd = products.filter(o => o.categoryId === categoryId);
  if (matchingProd.length === 0 ) { // If length is 0 then check if the category exist; if it is 0, it's ok to send empty array, otherwise 404
    if (!matchingCat) {
      res.status(404).send('Category not found');
      return;
    }
  }
  res.send(matchingProd);
});

categoryRouter.get('/categories/:id', checkIdLength, (req, res) => {
  const categoryId = req.params.id;
  const matching = categories.find(o => o.id === categoryId);
  if (!matching) {
       res.status(404).send('Category not found');
       return;
  }
  res.send(matching);
});

categoryRouter.post('/categories', (req, res) => {
  const category: Category = req.body;
  category.id = uuidv1() ;
  categories.push(category);
  res.status(201).send(category);
});

categoryRouter.put('/categories/:id', checkIdLength, findCategoryIndex, findElementIndex, (req, res) => {
  const { elementId , matchingIndex } = res.locals;
  const category: Category = req.body;
  category.id = elementId;
  categories[matchingIndex] = category;
  res.send(category);
 });

categoryRouter.delete('/categories/:id', checkIdLength, findCategoryIndex, findElementIndex, (req, res) => {
  categories.splice(res.locals.matchingIndex, 1);
  res.sendStatus(204);
 },
);

function checkIdLength(req: Request, res: Response, next: NextFunction) {
  const elementId = req.params.id;
  if (elementId.length !== 36) {
    res.status(400).send('Id should be 36 characters long');
    return;
  }
  next();
}

function checkNameLength(req: Request, res: Response, next: NextFunction) {
  if (req.body.name.length < 3) {
    res.status(409).send('Name should be 3 characters minimum');
    return;
  }
  next();
}

export {productRouter};
export {categoryRouter};
