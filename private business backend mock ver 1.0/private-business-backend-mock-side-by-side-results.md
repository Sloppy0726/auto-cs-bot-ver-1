# Private Business Backend Mock ver 1.0 - Side-by-side results

| Case | Expected | Actual |
|---|---|---|
| beauty available facial slot | {"found":true,"available":true} | {"found":true,"available":true,"facts":[{"key":"date","value":"2026-05-09"},{"key":"time","value":"19:00"},{"key":"service","value":"facial"},{"key":"available","value":true}],"reason":"Mock backend has an available slot/table."} |
| restaurant unavailable table | {"found":true,"available":false} | {"found":true,"available":false,"facts":[{"key":"date","value":"2026-05-09"},{"key":"time","value":"20:00"},{"key":"partySize","value":4},{"key":"available","value":false}],"reason":"Mock backend record is unavailable."} |
| ig shop stock available | {"found":true,"available":true} | {"found":true,"available":true,"facts":[{"key":"sku","value":"TEE-BLK-M"},{"key":"name","value":"Black tee M"},{"key":"available","value":true},{"key":"quantity","value":8}],"reason":"Stock is available in mock backend."} |
| ig shop order lookup | {"found":true} | {"found":true,"facts":[{"key":"orderId","value":"IG1002"},{"key":"status","value":"shipped"},{"key":"shipmentStatus","value":"in_transit"},{"key":"courier","value":"SF Express"}],"reason":"Order found in mock backend."} |
