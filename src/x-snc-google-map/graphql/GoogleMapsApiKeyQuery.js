const query =
`
query {
	GlideRecord_Query {
		sys_properties (queryConditions: "name={{sys_property_name}}") {
			_results {
				value {
					value
				}
			}
		}
	}
}
`;

export default query;