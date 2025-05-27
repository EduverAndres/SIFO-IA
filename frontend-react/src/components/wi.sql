CREATE OR REPLACE TABLE RAW_INVOICE AS
WITH raw_data_with_size AS (
    SELECT
        xml_data,
        file_name,
        row_number,
        -- Obtenemos el tamaño del xml_data en bytes.
        -- Si xml_data ya es un tipo VARIANT, devolverá el tamaño sin comprimir.
        -- Si xml_data es STRING, devolverá la longitud de la cadena en bytes.
        LENGTH(xml_data) AS xml_data_size_bytes
    FROM raw_facturacion_dian_xml
),
filtered_and_parsed_xml AS (
    SELECT
        PARSE_XML(xml_data) AS xml_parsed,
        file_name,
        row_number
    FROM raw_data_with_size
    WHERE xml_data_size_bytes <= (16 * 1024 * 1024) -- Filtra los datos XML que son más grandes de 16 MB
)
SELECT
    EXTRACT(YEAR FROM TRY_TO_DATE(GET(XMLGET(xml_parsed, 'cbc:IssueDate'), '$')::STRING))::INTEGER AS ISSUEYEAR,
    TO_CHAR(TRY_TO_DATE(GET(XMLGET(xml_parsed, 'cbc:IssueDate'), '$')::STRING), 'YYYYMM')::INTEGER AS ISSUEMONTH,
    GET(xml_parsed, '@') AS DocumentType,
    GET(XMLGET(xml_parsed, 'cbc:UBLVersionID'), '$')::STRING AS UBLVersionID,
    GET(XMLGET(xml_parsed, 'cbc:ID'), '$')::STRING AS InvoiceNumber,
    GET(XMLGET(xml_parsed, 'cbc:UUID'), '$')::STRING AS UUID,
    TRY_TO_DATE(GET(XMLGET(xml_parsed, 'cbc:IssueDate'), '$')::STRING) AS IssueDate,

    TRY_TO_TIMESTAMP_TZ(
        GET(XMLGET(xml_parsed, 'cbc:IssueDate'), '$')::STRING || 'T' ||
        SPLIT_PART(GET(XMLGET(xml_parsed, 'cbc:IssueTime'), '$')::STRING, ' ', 1),
        'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM'
    ) AS IssueTime,
    TRY_TO_DATE(SUBSTR(GET(XMLGET(xml_parsed, 'cbc:DueDate'), '$')::STRING, 1, 10)) AS DueDate,
    GET(XMLGET(xml_parsed, 'cbc:InvoiceTypeCode'), '$')::STRING AS InvoiceTypeCode,
    GET(XMLGET(xml_parsed, 'cbc:Note'), '$')::STRING AS Note,
    GET(XMLGET(xml_parsed, 'cbc:DocumentCurrencyCode'), '$')::STRING AS DocumentCurrencyCode,
    GET(XMLGET(xml_parsed, 'cbc:LineCountNumeric'), '$')::STRING AS LineCountNumeric,

    TRY_TO_DATE(SUBSTR(GET(XMLGET(XMLGET(xml_parsed, 'cac:InvoicePeriod'), 'cbc:StartDate'), '$')::STRING, 1, 10)) AS InvoicePeriod_StartDate,
    TRY_TO_DATE(SUBSTR(GET(XMLGET(XMLGET(xml_parsed, 'cac:InvoicePeriod'), 'cbc:EndDate'), '$')::STRING, 1, 10)) AS InvoicePeriod_EndDate,

    GET(XMLGET(XMLGET(xml_parsed, 'cac:AccountingSupplierParty'), 'cbc:AdditionalAccountID'), '$')::STRING AS Supplier_AccountID,
    GET(XMLGET(XMLGET(XMLGET(xml_parsed, 'cac:AccountingSupplierParty'), 'cac:Party'), 'cac:PartyName'), 'cbc:Name')::STRING AS Supplier_Name,

    GET(XMLGET(XMLGET(XMLGET(XMLGET(xml_parsed, 'cac:AccountingSupplierParty'), 'cac:Party'), 'cac:PhysicalLocation'), 'cac:Address'), 'cbc:ID')::STRING AS Supplier_Address_ID,
    GET(XMLGET(XMLGET(XMLGET(XMLGET(xml_parsed, 'cac:AccountingSupplierParty'), 'cac:Party'), 'cac:PhysicalLocation'), 'cac:Address'), 'cbc:CityName')::STRING AS Supplier_Address_City,

    GET(XMLGET(XMLGET(xml_parsed, 'cac:PaymentMeans'), 'cbc:ID'), '$')::STRING AS PaymentMeans_ID,
    GET(XMLGET(XMLGET(xml_parsed, 'cac:PaymentMeans'), 'cbc:PaymentMeansCode'), '$')::STRING AS PaymentMeans_Code,
    TRY_TO_DATE(SUBSTR(GET(XMLGET(XMLGET(xml_parsed, 'cac:PaymentMeans'), 'cbc:PaymentDueDate'), '$')::STRING, 1, 10)) AS PaymentMeans_DueDate,

    GET(XMLGET(XMLGET(xml_parsed, 'cac:TaxTotal'), 'cbc:TaxAmount'), '@currencyID')::STRING AS TaxTotal_Currency,
    TRY_TO_DECIMAL(GET(XMLGET(XMLGET(xml_parsed, 'cac:TaxTotal'), 'cbc:TaxAmount'), '$')::STRING, 18, 4) AS TaxTotal_Amount,

    GET(XMLGET(XMLGET(xml_parsed, 'cac:LegalMonetaryTotal'), 'cbc:LineExtensionAmount'), '@currencyID')::STRING AS Monetary_LineItems_Currency,
    TRY_TO_DECIMAL(GET(XMLGET(XMLGET(xml_parsed, 'cac:LegalMonetaryTotal'), 'cbc:LineExtensionAmount'), '$')::STRING, 18, 4) AS Monetary_LineItems_Amount,
    TRY_TO_DECIMAL(GET(XMLGET(XMLGET(xml_parsed, 'cac:LegalMonetaryTotal'), 'cbc:PayableAmount'), '$')::STRING, 18, 4) AS Monetary_Payable_Amount,

    file_name,
    row_number AS file_row_number,
    CURRENT_TIMESTAMP() AS load_timestamp
FROM filtered_and_parsed_xml;