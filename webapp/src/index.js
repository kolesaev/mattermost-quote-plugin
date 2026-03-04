import {id as pluginId} from './manifest';

export default class Plugin {
    initialize(registry, store) {
        this.store = store;
        
        // Регистрируем кнопку рядом с Reply
        registry.registerPostActionComponent(this.createPostActionComponent());
    }

    // Компонент для кнопки с классами как у Message actions
    createPostActionComponent() {
        return (props) => {
            const {post} = props;
            
            const handleClick = (e) => {
                e.preventDefault();
                if (post?.id) {
                    this.quotePostById(post.id);
                }
            };

            return window.React.createElement(
                'button',
                {
                    className: 'style--none post-menu__item',
                    onClick: handleClick,
                    title: 'Quote'
                },
                window.React.createElement('i', { 
                    className: 'icon fa fa-quote-left',
                    style: { 
                        fontSize: '16px',
                        color: 'currentColor'
                    }
                })
            );
        };
    }

    async quotePostById(postId) {
        if (!this.store) return;

        try {
            const state = this.store.getState();
            const posts = state.entities?.posts?.posts;
            
            if (posts && posts[postId]) {
                const post = posts[postId];
                
                // Получаем username из состояния пользователей
                const users = state.entities?.users?.profiles;
                const user = users?.[post.user_id];
                const username = user?.username || 'unknown';
                
                // Получаем прямую ссылку на сообщение
                const permalink = this.getPermalink(postId);
                const quoteLink = `@${username} - ${permalink}`;
                
                // Находим поле ввода (пробуем thread потом main)
                const textbox = this.getThreadTextbox() || this.getMainTextbox();
                
                if (textbox) {
                    // Сохраняем текущее значение, если есть
                    const currentValue = textbox.value;
                    const newValue = currentValue 
                        ? quoteLink + '\n\n\n' + currentValue
                        : quoteLink + '\n\n\n';
                    
                    textbox.value = newValue;
                    textbox.focus();
                    
                    // Перемещаем курсор в конец для удобства набора ответа
                    textbox.setSelectionRange(newValue.length, newValue.length);
                }
            } else {
                this.quoteViaDOM(postId);
            }
        } catch (error) {
            console.error('Error quoting post:', error);
            this.quoteViaDOM(postId);
        }
    }

    getPermalink(postId) {
        // Получаем базовый URL (протокол + хост)
        const baseUrl = window.location.origin;
        
        // Получаем название команды из пути URL (первый сегмент после слеша)
        const pathParts = window.location.pathname.split('/');
        const teamName = pathParts[1] || ''; // В вашем случае это 'calypso-group'
        
        if (teamName) {
            return `${baseUrl}/${teamName}/pl/${postId}`;
        } else {
            return `${baseUrl}/pl/${postId}`;
        }
    }

    getMainTextbox() {
        return document.getElementById('post_textbox') || 
               document.querySelector('[data-testid="post_textbox"]') ||
               document.querySelector('.post-create__textarea textarea') ||
               document.querySelector('.channel-textarea textarea') ||
               document.querySelector('textarea[aria-label*="write to"]');
    }

    getThreadTextbox() {
        return document.getElementById('reply_textbox') || 
               document.querySelector('[data-testid="reply_textbox"]') ||
               document.querySelector('.ThreadPane textarea') ||
               document.querySelector('.sidebar--right textarea') ||
               document.querySelector('.ThreadView textarea') ||
               document.querySelector('[aria-label*="Add a reply"]') ||
               document.querySelector('[placeholder*="Reply"]');
    }

    quoteViaDOM(postId) {
        // Fallback логика через DOM
        const postElement = postId 
            ? document.querySelector(`[data-post-id="${postId}"], #post_${postId}`)
            : document.querySelector('.post--hovered, .post--focused, .post:hover');
        
        if (postElement) {
            // Получаем username из элемента
            const usernameElement = postElement.querySelector('.user-popover, [data-testid="postHeader"] button');
            const username = usernameElement?.textContent?.trim() || 'user';
            
            // Получаем ID поста если не передан
            const actualPostId = postId || 
                                postElement.getAttribute('data-post-id') || 
                                postElement.id?.replace('post_', '');
            
            if (actualPostId) {
                const permalink = this.getPermalink(actualPostId);
                const quoteLink = `@${username} - ${permalink}`;
                
                const textbox = this.getThreadTextbox() || this.getMainTextbox();
                
                if (textbox) {
                    const currentValue = textbox.value;
                    const newValue = currentValue 
                        ? quoteLink + '\n\n\n' + currentValue
                        : quoteLink + '\n\n\n';
                    
                    textbox.value = newValue;
                    textbox.focus();
                    textbox.setSelectionRange(newValue.length, newValue.length);
                }
            }
        }
    }
}

window.registerPlugin(pluginId, new Plugin());