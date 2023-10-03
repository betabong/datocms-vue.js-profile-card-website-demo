import { Record, StructuredText } from 'datocms-structured-text-utils';

export function splitStructuredField<R1 extends Record = Record, R2 extends Record = R1>(data: StructuredText<R1, R2>) {
	const result: (StructuredText<Record, R2> | R1)[] = [];
	let currentDocument: StructuredText<Record, R2> | undefined;

	data.value.document.children.forEach((child) => {
		if (child.type === 'block') {
			if (currentDocument) {
				result.push(currentDocument);
				currentDocument = undefined;
			}
			const block = data.blocks?.find((block) => block.id === child.item);
			if (block) result.push(block);
		} else {
			if (!currentDocument) {
				currentDocument = {
					...data,
					blocks: undefined,
					value: {
						...data.value,
						document: {
							...data.value.document,
							children: [],
						},
					},
				};
			}
			currentDocument.value.document.children.push(child);
		}
	});

	return result;
}
