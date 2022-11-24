const fetch = require("node-fetch");

async function inventory(userID, assetID) {
  const { IsValid, Data } = await fetch(
    `https://www.roblox.com/users/inventory/list-json?assetTypeId=${assetID}&cursor=&itemsPerPage=100&pageNumber=1&userId=${userID}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());

  if (!IsValid) {
    return console.log(Data);
  } else {
    let items = [];
    for (const { Product, Item } of Data.Items) {
      if (Product?.IsLimitedUnique ?? Product?.IsLimited) {
        const { Name, AssetType, AssetId } = Item;
        const { PriceInRobux } = Product;
        items.push({
          name: Name ?? undefined,
          price: PriceInRobux ?? undefined,
          assetType: AssetType ?? undefined,
          assetID: AssetId ?? undefined,
        });
      }
    }
    return items;
  }
}

async function test() {
  let data;
  let count = 0;

  const assetIDS = [41, 8, 42, 43, 44, 45, 46, 47, 19, 18, 17];
  try {
    for (const assetID of assetIDS) {
      for (let i = 500000000; i < 1000000000; i++) {
        const invInfo = await inventory(i, assetID);
        console.log(i);
        if (invInfo) {
          if (invInfo.length > 0) {
            data = invInfo;
            count = i;
          }
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
  if (data.length > 0 && !data) {
    return;
  }

  for (const { name, price, assetType, assetID } of data) {
    console.log(
      name ?? undefined,
      price ?? undefined,
      assetType ?? undefined,
      assetID ?? undefined,
      count
    );
  }
}
test();
