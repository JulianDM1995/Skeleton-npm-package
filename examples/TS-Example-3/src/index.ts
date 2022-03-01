import * as path from "path";
import Skeleton, { FolderSkeleton } from "skeleton-code-generator";

const init = () => {
const Pages = {
    name: "Pages",
    files: [
        {
            name: "Home.page.tsx",
            content: ComponentBody("Home")
        },
        {
            name: "About.page.tsx",
            content: ComponentBody("About")
        },
        {
            name: "TermsAndConditions.page.tsx",
            content: ComponentBody("TermsAndConditions")
        },
        {
            name: "PrivacyPolicy.page.tsx",
            content: ComponentBody("PrivacyPolicy")
        },
        {
            name: "Contact.page.tsx",
            content: ComponentBody("Contact")
        },
        {
            name: "App.page.tsx",
            content: ComponentBody("App")
        },
        {
            name: "Login.page.tsx",
            content: ComponentBody("App")
        },
        {
            name: "Register.page.tsx",
            content: ComponentBody("App")
        },
    ]
}

const AppComponents = {
    name: "App",
    files: [
        {
            name: "ProductCard.tsx",
            content: ComponentBody("ProductCard")
        },
        {
            name: "ProductFull.tsx",
            content: ComponentBody("ProductFull")
        },
        {
            name: "AllProducts.tsx",
            content: ComponentBody("AllProducts")
        },
        {
            name: "ProductNotFound.tsx",
            content: ComponentBody("ProductNotFound")
        },
    ]
}

const Layout = {
    name: "Layout",
    files: [
        {
            name: "Header.layout.tsx",
            content: ComponentBody("Header")
        },
        {
            name: "Body.layout.tsx",
            content: ComponentBody("Body")
        },
        {
            name: "Background.layout.tsx",
            content: ComponentBody("Background")
        },
        {
            name: "Sidebar.layout.tsx",
            content: ComponentBody("Background")
        },
    ]
}

const CommonComponents = {
    name: "Common",
    files: [
        {
            name: "Title.tsx",
            content: ComponentBody("Title")
        },
        {
            name: "Text.tsx",
            content: ComponentBody("Text")
        },
        {
            name: "Link.tsx",
            content: ComponentBody("Link")
        },
        {
            name: "Button.tsx",
            content: ComponentBody("Button")
        },
        {
            name: "Subfolder0\\Subfolder1\\aaa1\\aaa2\\aaa3\\Spacer.tsx",
            content: ComponentBody("Spacer")
        },
        {
            name: "ContactButton.tsx",
            content: ComponentBody("ContactButton")
        },
    ]
}

const Components = {
    name: 'Components',
    subfolders: [Layout, AppComponents, CommonComponents],

}

const RootFolder = {
    name: "dist",
    subfolders: [Components, Pages]
}

Skeleton.generateFromJSON(__dirname, RootFolder)
}

const randomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const ComponentBody = (name: string) =>
    `import styled from "styled-components"

export const ${name} = () => {
  return (
    <${name}Container>${name}</${name}Container>
  )
}

const ${name}Container = styled.div\`
//background-color: ${randomColor()}
\`
`
init();