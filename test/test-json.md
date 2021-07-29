# Settings

Demo for syntax highlighting

```json
...
"items" : [
    {
        "name":"sampleName",
        "type":"string",
        "label":"MeasurementResources.SampleName"
    },
    {
        "name":"power",
        "type":"double",
        "label":"MeasurementResources.Power"
    },
    {
        "name":"coolGasFlow",
        "type":"double",
        "label":"MeasurementResources.CoolGasFlow"
    },        
    {
        "name":"pumpEnabled",
        "type":"toggle",
        "label":"MeasurementResources.EnablePump"
    },
    {
        "name":"nebulizerType",
        "type":"dropdown",
        "label":"MeasurementResources.NeublizerType",
        "valueType" : "integer",
        "options": [
            { "key": 0, text:"MeasurementResources.NebulizerTypeA" },
            { "key": 1, text:"MeasurementResources.NebulizerTypeB" },
            { "key": 2, text:"MeasurementResources.NebulizerTypeC" }
        ]
    }
]
...
```
