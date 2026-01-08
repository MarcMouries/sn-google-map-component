# Use Cases

This document describes real-world use cases for the Location Intelligence Component.

## Use Case Comparison

| Feature | Fraud Detection | Audit Planning | Disease Outbreak Tracking |
|---------|----------------|----------------|---------------------------|
| **Goal** | Detect fraud patterns | Plan efficient audit trips | Monitor global outbreaks |
| **Circle** | Define suspicious area | Define travel radius | Define outbreak zone |
| **Markers** | Transaction locations | Service provider locations | Outbreak locations |
| **Distance** | Flag unrealistic travel | Plan visit routes | Track spread patterns |
| **Inside Circle** | Items to investigate | Locations to visit | Affected regions |

---

## Fraud Detection

### Summary
Streamline and automate the process of identifying and flagging suspicious transactions based on location patterns.

### Details
A customized application that flags potential risks based on preset parameters such as high-frequency transactions, high-volume purchases, multiple location purchases, and impossibly quick transitions between locations.

The system ingests transaction data, applies rule-based analysis to identify potential red flags, and assigns a risk level - High, Medium, or Low - to each transaction.

The data is presented in a user-friendly interface where analysts can review and further investigate flagged transactions. Each risk level is color-coded to help easily highlight the urgency of the case.

### How the Map Component Helps
The map component pinpoints where transactions occurred within a specified area and calculates the driving distances between these locations. The goal is to highlight instances where the distances between transactions are too vast to have been realistically made by the same individual, thereby assisting in the identification of fraudulent activity.

---

## Audit Planning

### Summary
Help inspectors find service providers within a given radius to determine which ones to visit during an audit trip.

### Details
Inspectors need to plan efficient audit trips by:
1. Setting their starting location (hotel, airport, or office)
2. Defining a travel radius (e.g., 50 miles)
3. Viewing all service provider locations within that radius
4. Seeing driving distances/times to each location
5. Planning which locations to visit based on proximity

### How the Map Component Helps
- **Circle overlay**: Defines the maximum travel radius for the trip
- **Markers**: Show all service provider locations
- **Distance calculation**: Shows driving time to each location
- **Markers inside circle**: Filters to only relevant locations within travel range

---

## Disease Outbreak Tracking

### Summary
Display disease outbreaks around the world on a map, with a workspace to drill into outbreak details.

### Data Source
Existing outbreak records in ServiceNow tables containing:
- Outbreak location (latitude/longitude)
- Disease information
- Case statistics
- Timeline data

### Details
Public health analysts need to:
1. Plot outbreak records on a global map
2. Filter by disease type, severity, or date range
3. Click on markers to see outbreak details (cases, deaths, timeline)
4. Identify clusters and spread patterns
5. Access a detailed workspace for investigation

### Marker Requirements
Each outbreak marker should include:
- **Location**: Latitude/longitude of the outbreak
- **Disease type**: Name of the disease (e.g., Cholera, Measles, Dengue)
- **Severity level**: Color-coded (red=critical, orange=high, yellow=moderate, green=low)
- **Case count**: Number of confirmed cases
- **Date reported**: When the outbreak was first reported
- **Status**: Active, contained, or resolved

### Features Needed
- **Heat map visualization**: Show density of outbreaks by region
- **Time-based filtering**: Filter outbreaks by date range
- **Category filtering**: Filter by disease type or severity
- **Drill-down workspace**: Click to open detailed outbreak record
- **Custom marker icons**: Different icons for different disease types
- **Real-time updates**: Refresh data from ServiceNow tables

### How the Map Component Helps
- **Global view**: Display outbreaks worldwide with appropriate zoom levels
- **Marker clustering**: Group nearby outbreaks at lower zoom levels
- **Info windows**: Show quick summary on marker click
- **Integration**: Connect to ServiceNow workspace for detailed investigation
- **Localization**: Support multiple languages for international users
