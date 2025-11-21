"use client";
import React from 'react';
import Editor from 'react-simple-wysiwyg';
import { useBundleProduct } from "@/features/bundles";

export function EditorWysiwyg () {

    //const {handleDescriptionChange} = useBundleProduct(mode);

    const [value, setValue] = React.useState('');
    const onChangeHandler = () => {
        setValue(e.target.value);
    }

    return (
        <>
            <Editor value={value} onChange={onChangeHandler} />
        </>
    );
}
