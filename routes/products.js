const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  console.log(req.query);
  if (Object.keys(req.query).length > 0) {
    const { subcategory, category, search } = req.query;
    const filtered = productInfo.filter(
      (product) =>
        (category ? product.category == category : true) &&
        (subcategory ? product.subcategory == subcategory : true) &&
        (search
          ? product.name
              .toLocaleLowerCase()
              .includes(search.toLocaleLowerCase()) ||
            product.category.toLocaleLowerCase() ==
              search.toLocaleLowerCase() ||
            product.subcategory.toLocaleLowerCase() ==
              search.toLocaleLowerCase()
          : true)
    );
    res.json(filtered);
  } else {
    res.json(productInfo);
  }
});

// router.get("/categories/", (req, res, next) => {

//   res.json(categories);
// });
router.get("/:id", (req, res, next) => {
  const id = req.params["id"];
  const found = productInfo.find((item) => item.productId == id);

  found ? res.json(found) : res.status(404).json({ error: "not found" });
});

module.exports = router;
