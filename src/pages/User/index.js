import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container, Header, Avatar, 
         Name, Bio, Stars, Starred,
         OwnerAvatar, Info, Title, 
         Author, Loading
        } from './styles';

import api from '../../services/api'; //acessando api do github

export default class User extends Component {
    static navigationOptions = ({ navigation }) =>  ({
        title: navigation.getParam('user').name
    });

    static propTypes = {
        navigation: PropTypes.shape({
            getParam: PropTypes.func
        }).isRequired
    };

    state = {
        stars: [],
        loading: true, //icone de loading
        page: 1 //paginação
    }

    async componentDidMount() {
        this.load();
    }

    load = async (page = 1 ) => {
        const { navigation } = this.props;
        const user = navigation.getParam('user');

        this.setState({ 
            loading: true
        });
        
        const response = await api.get(`/users/${user.login}/starred`, { //acessar repositorios favoritados pelo usuario
            params: { page } //paginação    
        }); 
        
        this.setState({ 
            stars: response.data, 
            loading: false,
            page,
            refreshing: false //arrastar a listagem de repositórios favoritados pra baixo atualiza a lista resetando o estado
        });
    }

    loadMore = () => {
        const { page } = this.state;

        const nextPage = page + 1;

        this.load(nextPage);
    }

    refreshList = () => {
        this.setState({ refreshing: true });

        this.load();
    }

    render () {
        const { navigation } = this.props;
        const { stars, loading, refreshing } = this.state;

        const user = navigation.getParam('user');

        return (
            <Container>
                <Header>
                    <Avatar source={{ uri: user.avatar }} />
                    <Name>{user.name}</Name>
                    <Bio>{user.bio}</Bio>
                </Header>

                    { loading ? ( 
                        <Loading />
                    ) : ( 
                        <Stars 
                        data={stars}
                        keyExtractor={ star => String(star.id) }
                        onEndReachedThreshold={0.2} // Carrega mais itens quando chegar em 20% do fim
                        onEndReached={ this.loadMore } // Função que carrega mais itens
                        onRefresh={ this.refreshList } // Função dispara quando o usuário arrasta a lista pra baixo
                        refreshing={ refreshing} // Variável que armazena um estado true/false que representa se a lista está atualizando
                        renderItem={({ item }) => (
                           <Starred>
                                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                                <Info>
                                    <Title>{item.name}</Title>
                                    <Author>{item.owner.login}</Author>
                                </Info>
                           </Starred>
                        )}
                       />
                    )}
            </Container>
        );
    }
}