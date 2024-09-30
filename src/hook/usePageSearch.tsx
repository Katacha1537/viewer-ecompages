import { db } from '@/firebase/config';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface Page {
    idPage: string;
    slug: string;
}

interface DomainData {
    name: string;
    pages: Page[];
    createdAt: string;
    [key: string]: any; // Outras propriedades que possam existir no documento
}

const usePageSearch = (domainPage: string, pathName: string, slug: string | null) => {
    const [idPage, setIdPage] = useState<string | null>(null);
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const fetchDomainData = async () => {
            try {
                // Verifica se estamos em ambiente local ou em um domínio específico
                if (domainPage === 'localhost' || domainPage === 'viewer-ecompages.vercel.app') {
                    // Consulta a página pelo slug
                    const pageQuery = query(
                        collection(db, 'paginas'),
                        where('slug', '==', slug)
                    );

                    const pageSnapshot = await getDocs(pageQuery);

                    if (!pageSnapshot.empty) {
                        const pageDoc = pageSnapshot.docs[0];
                        const pageData = pageDoc.data();

                        if (pageData.isPublic) {
                            setContent(pageData.content || '');
                        } else {
                            setError('Página não está pública.');
                        }
                    } else {
                        setError('Página não encontrada.');
                    }

                    setLoading(false);
                    return;
                }

                // Busca por domínio
                const domainQuery = query(
                    collection(db, 'domains'),
                    where('domain', '==', domainPage)
                );

                const domainSnapshot = await getDocs(domainQuery);

                if (!domainSnapshot.empty) {
                    const domainDoc = domainSnapshot.docs[0];
                    const domainData = domainDoc.data() as DomainData;

                    // Remove a barra inicial do pathName
                    const cleanPathName = pathName.startsWith('/') ? pathName.slice(1) : pathName;

                    // Busca a página correspondente ao slug
                    const matchedPage = domainData.pages.find((page) =>
                        cleanPathName ? page.slug === cleanPathName : page.slug === ''
                    );

                    if (matchedPage) {
                        // Busca a página no Firestore
                        const pageRef = doc(db, 'paginas', matchedPage.idPage);
                        const pageSnap = await getDoc(pageRef);

                        if (pageSnap.exists()) {
                            const pageData = pageSnap.data();
                            if (pageData?.isPublic) {
                                setContent(pageData.content || '');
                            } else {
                                setError('Página não está pública.');
                            }
                        } else {
                            setError('Página não encontrada.');
                        }

                        setIdPage(matchedPage.idPage);
                    } else {
                        setError('Slug não encontrado.');
                    }
                } else {
                    setError('Domínio não encontrado.');
                }
            } catch (err: any) {
                console.error('Erro ao buscar dados do domínio', err.message || err);
                setError('Erro ao buscar dados do domínio: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        if (domainPage) {
            fetchDomainData();
        }
    }, [domainPage, pathName, slug]);

    return { idPage, content, loading, error };
};

export default usePageSearch;
