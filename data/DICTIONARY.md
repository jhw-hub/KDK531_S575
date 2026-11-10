# Harbor Rentals — original fictional practice data

This small original dataset is NOT K531's teaching case and does not reflect a real company's customers. The deterministic generation script is `generate.py` (seed 531575). Do not replace these records with private course datasets in a shared deployment.

| Field | Unit | Meaning |
| --- | --- | --- |
| booking_id | identifier | Unique synthetic reservation identifier |
| day_index | day | Days since synthetic period start |
| location | category | North, South, East |
| customer_segment | category | New or Returning |
| rental_days | days | Length of rental |
| daily_rate | USD/day | Applied daily price |
| revenue | USD | rental_days × daily_rate |
| service_cost | USD | Synthetic variable cost |
| promo | 0/1 | Whether a synthetic marketing offer was shown; **not a causal treatment assignment** |
| cancelled | 0/1 | Synthetic later cancellation flag |

The generated CSV deliberately contains some missing `daily_rate` values and two duplicate `booking_id` records for cleaning practice. The simple relationships are illustrative, not validated real-world models. The generation process uses a fixed random seed.
